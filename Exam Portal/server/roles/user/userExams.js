const express = require("express");
const db = require("../config/db.js");

const router = express.Router();


function getContext(req) {
  return {
    userId: Number(req.headers["user-id"] || null),
    userRole: String(req.headers["user-role"] || "").toUpperCase(),
    orgId: req.headers["org-id"] ? Number(req.headers["org-id"]) : null,
    query: req.query || {}
  };
}

function computeStatus(exam) {
  const now = new Date();
  const start = exam.start_time ? new Date(exam.start_time) : null;
  const end = exam.end_time ? new Date(exam.end_time) : null;

  if (exam.attempt_status === "completed") return "Completed";
  if (exam.attempted_at) return "Attempted";
  if (start && now < start) return "Not Started";
  if (start && end && now >= start && now <= end) return "Ongoing";
  if (end && now > end) return "Expired";

  return "Not Started";
}


function formatDateISO(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().split("T")[0];
}

router.get("/my-exams", async (req, res) => {
  try {
    const { userId, userRole, orgId, query } = getContext(req);

 
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user-id header required",
      });
    }

    if (userRole !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Access denied — USER only",
      });
    }

   
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 20));
    const offset = (page - 1) * limit;

    
    const search = query.search ? `%${query.search}%` : null;
    const type = query.type ? String(query.type).toLowerCase() : null;
    const statusFilter = query.status ? String(query.status).toLowerCase() : null;

    let params = [userId];
    let where = "WHERE ue.user_id = $1";

    if (orgId) {
      params.push(orgId);
      where += ` AND e.organization_id = $${params.length}`;
    }

    if (type) {
      params.push(type);
      where += ` AND LOWER(e.exam_type) = $${params.length}`;
    }

    if (search) {
      params.push(search);
      where += ` AND LOWER(e.name) LIKE LOWER($${params.length})`;
    }

    params.push(limit);
    params.push(offset);
    const limitIndex = params.length - 1;
    const offsetIndex = params.length;


    const sql = `
      SELECT
        e.id AS exam_id,
        e.name,
        e.exam_type,
        e.difficulty,
        e.duration,
        e.total_questions,
        e.start_time,
        e.end_time,
        ue.attempt_status,
        ue.attempted_at,
        ue.score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      ${where}
      ORDER BY e.start_time ASC NULLS LAST
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const rows = await db.query(sql, params);

    
    let countParams = [userId];
    let countWhere = "WHERE ue.user_id = $1";

    if (orgId) {
      countParams.push(orgId);
      countWhere += ` AND e.organization_id = $${countParams.length}`;
    }
    if (type) {
      countParams.push(type);
      countWhere += ` AND LOWER(e.exam_type) = $${countParams.length}`;
    }
    if (search) {
      countParams.push(search);
      countWhere += ` AND LOWER(e.name) LIKE LOWER($${countParams.length})`;
    }

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      ${countWhere}
    `;

    const countRes = await db.query(countSql, countParams);
    const total = Number(countRes[0]?.total || 0);

   
    let exams = rows.map((exam) => {
      const status = computeStatus(exam);

      const isActive =
        exam.start_time &&
        exam.end_time &&
        new Date() >= new Date(exam.start_time) &&
        new Date() <= new Date(exam.end_time);

      return {
        exam_id: exam.exam_id,
        name: exam.name,
        exam_type: exam.exam_type,
        difficulty: exam.difficulty,
        duration: exam.duration,
        total_questions: exam.total_questions,
        start_time: exam.start_time,
        end_time: exam.end_time,
        deadline: formatDateISO(exam.end_time),
        attempt_status: exam.attempt_status,
        attempted_at: exam.attempted_at,
        score: exam.score,
        percentage: exam.score !== null ? Number(exam.score) : null,
        status,
        ui_badge: isActive ? "Active" : "Inactive",
      };
    });

    /* ---------------------------
       Apply Status Filter (optional)
    --------------------------- */
    if (statusFilter) {
      exams = exams.filter(
        (e) => e.status.toLowerCase() === statusFilter
      );
    }

    /* -----------------------------------------------------
       Send Final Output
    ----------------------------------------------------- */
    return res.json({
      success: true,
      data: {
        exams,
        meta: {
          total,
          page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in /my-exams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load assigned exams",
      error: error.message,
    });
  }
});

module.exports = router;
