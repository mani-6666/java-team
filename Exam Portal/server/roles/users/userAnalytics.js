
const express = require("express");
const db = require("../config/db.js");
const router = express.Router();


function getContext(req) {
  return {
    userId: req.user?.id || null,
    userRole: req.user?.role ? String(req.user.role).toUpperCase() : null,
    orgId: req.user?.organizationId || req.user?.organization_id || null,
  };
}

function formatRank(rank) {
  if (!rank) return null;
  const r = parseInt(rank);
  const suffix = ["th", "st", "nd", "rd"];
  const v = r % 100;
  return r + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}


router.get("/analytics/summary", async (req, res) => {
  try {
    const { userId, userRole, orgId } = getContext(req);

    if (!userId)
      return res.status(400).json({ success: false, message: "User not authenticated" });

    if (userRole !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM exams WHERE is_deleted = false ${orgId ? "AND org_id = $2" : ""}) AS total_exams,
        COUNT(DISTINCT ea.exam_id) AS attempted
      FROM exam_attempt ea
      JOIN exams e ON ea.exam_id = e.exam_id
      WHERE ea.user_id = $1
      AND ea.status = 'completed'
      AND e.is_deleted = false
      ${orgId ? "AND e.org_id = $2" : ""}
    `;

    const result = await db.query(query, orgId ? [userId, orgId] : [userId]);
    const row = result.rows[0];

    const totalExams = Number(row.total_exams || 0);
    const attempted = Number(row.attempted || 0);
    const pending = Math.max(totalExams - attempted, 0);
    const completionRate =
      totalExams > 0 ? Number(((attempted / totalExams) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: { totalExams, attempted, pending, completionRate },
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load exam summary" });
  }
});


router.get("/analytics/performance", async (req, res) => {
  try {
    const { userId, userRole, orgId } = getContext(req);

    if (!userId || userRole !== "USER")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const [stats, recent] = await Promise.all([
      db.query(
        `
        SELECT 
          ROUND(AVG(ea.percentage),1) AS avg,
          MAX(ea.percentage) AS max,
          MIN(ea.percentage) AS min
        FROM exam_attempt ea
        JOIN exams e ON ea.exam_id = e.exam_id
        WHERE ea.user_id = $1
        AND ea.status = 'completed'
        AND e.is_deleted = false
        ${orgId ? "AND e.org_id = $2" : ""}
        `,
        orgId ? [userId, orgId] : [userId]
      ),
      db.query(
        `
        SELECT ea.percentage
        FROM exam_attempt ea
        JOIN exams e ON ea.exam_id = e.exam_id
        WHERE ea.user_id = $1
        AND ea.status = 'completed'
        AND e.is_deleted = false
        ${orgId ? "AND e.org_id = $2" : ""}
        ORDER BY ea.ended_at DESC
        LIMIT 2
        `,
        orgId ? [userId, orgId] : [userId]
      ),
    ]);

    let improvement = 0;
    if (recent.rows.length === 2) {
      improvement = recent.rows[0].percentage - recent.rows[1].percentage;
    }

    res.json({
      success: true,
      data: {
        averageScore: Number(stats.rows[0].avg || 0),
        highestScore: Number(stats.rows[0].max || 0),
        lowestScore: Number(stats.rows[0].min || 0),
        improvement: Number(improvement.toFixed(1)),
      },
    });
  } catch (err) {
    console.error("PERFORMANCE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load performance metrics" });
  }
});


router.get("/analytics/ranks", async (req, res) => {
  try {
    const { userId, userRole, orgId } = getContext(req);

    if (!userId || userRole !== "USER")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const [overall, last] = await Promise.all([
      db.query(
        `
        SELECT 
          ROUND(AVG(ea.rank)) AS avg_rank,
          MIN(ea.rank) AS best_rank
        FROM exam_attempt ea
        JOIN exams e ON ea.exam_id = e.exam_id
        WHERE ea.user_id = $1
        AND ea.status = 'completed'
        AND ea.rank IS NOT NULL
        AND e.is_deleted = false
        ${orgId ? "AND e.org_id = $2" : ""}
        `,
        orgId ? [userId, orgId] : [userId]
      ),
      db.query(
        `
        SELECT ea.rank
        FROM exam_attempt ea
        JOIN exams e ON ea.exam_id = e.exam_id
        WHERE ea.user_id = $1
        AND ea.status = 'completed'
        AND ea.rank IS NOT NULL
        AND e.is_deleted = false
        ${orgId ? "AND e.org_id = $2" : ""}
        ORDER BY ea.ended_at DESC
        LIMIT 1
        `,
        orgId ? [userId, orgId] : [userId]
      ),
    ]);

    res.json({
      success: true,
      data: {
        averageRank: formatRank(overall.rows[0]?.avg_rank),
        lastExamRank: formatRank(last.rows[0]?.rank),
        bestExamRank: formatRank(overall.rows[0]?.best_rank),
        overallSubjectRank: formatRank(overall.rows[0]?.avg_rank),
      },
    });
  } catch (err) {
    console.error("RANK ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load rank data" });
  }
});


router.get("/analytics/monthly-assessment", async (req, res) => {
  try {
    const { userId, userRole, orgId } = getContext(req);
    const { period } = req.query;

    if (!userId || userRole !== "USER")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    let interval = "6 months"; // default
    if (period === "1year") interval = "1 year";

    const query = `
      SELECT 
        TO_CHAR(ea.ended_at, 'Mon YYYY') AS month,
        COALESCE(e.subject, 'Other') AS subject,
        ROUND(AVG(ea.percentage), 1) AS average_score,
        COUNT(*) AS attempts
      FROM exam_attempt ea
      JOIN exams e ON ea.exam_id = e.exam_id
      WHERE ea.user_id = $1
      AND ea.status = 'completed'
      AND ea.ended_at >= CURRENT_DATE - INTERVAL '${interval}'
      AND e.is_deleted = false
      ${orgId ? "AND e.org_id = $2" : ""}
      GROUP BY month, e.subject
      ORDER BY MIN(ea.ended_at)
    `;

    const result = await db.query(query, orgId ? [userId, orgId] : [userId]);

    res.json({
      success: true,
      period: interval,
      data: result.rows.map(r => ({
        month: r.month,
        subject: r.subject,
        averageScore: Number(r.average_score),
        attempts: Number(r.attempts),
      })),
    });
  } catch (err) {
    console.error("MONTHLY ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load monthly assessment" });
  }
});


router.get("/analytics/exam-wise-performance", async (req, res) => {
  try {
    const { userId, userRole, orgId } = getContext(req);
    const { from, to } = req.query;

    if (!userId || userRole !== "USER")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    let values = [userId];
    let idx = 2;
    let filters = "";

    if (orgId) {
      values.push(orgId);
      idx++;
    }
    if (from) {
      filters += ` AND ea.ended_at >= $${idx}`;
      values.push(from);
      idx++;
    }
    if (to) {
      filters += ` AND ea.ended_at <= $${idx}`;
      values.push(to);
    }

    const query = `
      SELECT 
        e.exam_id,
        e.title,
        COALESCE(e.subject,'General') AS subject,
        ea.percentage AS score,
        ea.rank,
        ea.ended_at
      FROM exam_attempt ea
      JOIN exams e ON ea.exam_id = e.exam_id
      WHERE ea.user_id = $1
      AND ea.status = 'completed'
      AND e.is_deleted = false
      ${orgId ? "AND e.org_id = $2" : ""}
      ${filters}
      ORDER BY ea.ended_at DESC
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      data: result.rows.map(r => ({
        examId: r.exam_id,
        examTitle: r.title,
        subject: r.subject,
        score: Number(r.score || 0),
        rank: r.rank,
        completedAt: r.ended_at,
      })),
    });
  } catch (err) {
    console.error("EXAM-WISE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load exam-wise performance" });
  }
});

module.exports = router;
