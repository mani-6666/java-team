
import express from "express";
import db from "../config/db.js";

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
      return res.status(400).json({ success: false, message: "user-id header required" });
    }
    if (userRole !== "USER") {
      return res.status(403).json({ success: false, message: "Access denied (USER only)" });
    }

   
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 20));
    const offset = (page - 1) * limit;

    const search = query.search ? `%${query.search}%` : null;
    const type = query.type ? String(query.type) : null;
    const statusFilter = query.status ? String(query.status).toLowerCase() : null;


    let params = [userId];
    let where = "WHERE ue.user_id = $1";

    if (orgId) {
      params.push(orgId);
      where += ` AND e.organization_id = $${params.length}`;
    }
    if (type) {
      params.push(type.toLowerCase());
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

    const querySql = `
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

    const rows = await db.query(querySql, params);

    let totalParams = [userId];
    let totalWhere = "WHERE ue.user_id = $1";
    if (orgId) {
      totalParams.push(orgId);
      totalWhere += ` AND e.organization_id = $${totalParams.length}`;
    }
    if (type) {
      totalParams.push(type.toLowerCase());
      totalWhere += ` AND LOWER(e.exam_type) = $${totalParams.length}`;
    }
    if (search) {
      totalParams.push(search);
      totalWhere += ` AND LOWER(e.name) LIKE LOWER($${totalParams.length})`;
    }

    const totalQuery = `
      SELECT COUNT(*)::int AS total
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      ${totalWhere}
    `;
    const totalRes = await db.query(totalQuery, totalParams);
    const total = Number(totalRes[0]?.total || 0);

   
    let exams = rows.map(r => {
      const status = computeStatus(r);

      let isActive = false;
      if (r.start_time && r.end_time) {
        const now = new Date();
        isActive = now >= new Date(r.start_time) && now <= new Date(r.end_time);
      }

      const scorePercent = (r.score !== null && r.score !== undefined) ? Number(r.score) : null;

      return {
        exam_id: r.exam_id,
        name: r.name,
        exam_type: r.exam_type,      
        difficulty: r.difficulty,     
        duration: r.duration,         
        total_questions: r.total_questions,
        deadline: formatDateISO(r.end_time),
        start_time: r.start_time,
        end_time: r.end_time,
        attempt_status: r.attempt_status,
        attempted_at: r.attempted_at,
        score: r.score,
        percentage: scorePercent,    
        ui_badge: isActive ? "Active" : "Inactive",
        status,                       
      };
    });

    if (statusFilter) {
      exams = exams.filter(e => e.status.toLowerCase() === statusFilter);
    }

    return res.json({
      success: true,
      data: {
        exams,
        meta: { total, page, limit }
      }
    });

  } catch (err) {
    console.error("Error /my-exams:", err);
    return res.status(500).json({ success: false, message: "Failed to load assigned exams", error: err.message });
  }
});

export default router;
