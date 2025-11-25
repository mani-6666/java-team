// routes/userAnalytics.js
const express = require("express");
const db = require("../config/db");

const router = express.Router();


function getContext(req) {
  return {
    userId: req.user?.id || null,
    userRole: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
    query: req.query || {},
  };
}


async function validateUserOrg(userId, orgId) {
  if (!userId || !orgId) return false;

  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);

  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}

function buildDateFilter(period) {
  switch (String(period).toLowerCase()) {
    case "month":
      return "AND ue.attempted_at >= NOW() - INTERVAL '30 days'";
    case "3months":
      return "AND ue.attempted_at >= NOW() - INTERVAL '90 days'";
    case "6months":
      return "AND ue.attempted_at >= NOW() - INTERVAL '180 days'";
    case "year":
      return "AND ue.attempted_at >= NOW() - INTERVAL '365 days'";
    default:
      return ""; // all time
  }
}


async function verifyUserAndOrg(req, res) {
  const { userId, userRole, orgId, query } = getContext(req);

  if (!userId) {
    res.status(400).json({ success: false, message: "User not found" });
    return null;
  }

  if (userRole !== "USER") {
    res.status(403).json({ success: false, message: "Unauthorized" });
    return null;
  }

  if (orgId && !(await validateUserOrg(userId, orgId))) {
    res.status(403).json({
      success: false,
      message: "User does not belong to this organization",
    });
    return null;
  }

  return { userId, userRole, orgId, query };
}


router.get("/analytics/summary", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period = "all" } = query;
    const dateFilter = buildDateFilter(period);

    const totalQ = `
      SELECT COUNT(*)::int AS total_exams
      FROM exams e
      WHERE e.is_active = TRUE
      ${orgId ? "AND e.organization_id = $1" : ""}
    `;
    const totalR = await db.query(totalQ, orgId ? [orgId] : []);
    const totalExams = totalR.rows[0]?.total_exams || 0;

    const attemptedQ = `
      SELECT COUNT(DISTINCT ue.exam_id)::int AS attempted_exams
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
    `;
    const attemptedR = await db.query(
      attemptedQ,
      orgId ? [userId, orgId] : [userId]
    );
    const attemptedExams = attemptedR.rows[0]?.attempted_exams || 0;

    const pendingExams = Math.max(totalExams - attemptedExams, 0);
    const completionRate =
      totalExams > 0
        ? Number(((attemptedExams / totalExams) * 100).toFixed(1))
        : 0;

    return res.json({
      success: true,
      data: {
        totalExams,
        attempted: attemptedExams,
        pending: pendingExams,
        completionRate, // %
      },
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load exam summary" });
  }
});


router.get("/analytics/performance", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period = "all" } = query;
    const dateFilter = buildDateFilter(period);

    const perfQ = `
      SELECT
        COALESCE(ROUND(AVG(ue.score), 2), 0) AS avg_score,
        COALESCE(MAX(ue.score), 0) AS highest_score,
        COALESCE(MIN(ue.score), 0) AS lowest_score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
    `;
    const perfR = await db.query(
      perfQ,
      orgId ? [userId, orgId] : [userId]
    );
    const avgScore = Number(perfR.rows[0]?.avg_score || 0);
    const highestScore = Number(perfR.rows[0]?.highest_score || 0);
    const lowestScore = Number(perfR.rows[0]?.lowest_score || 0);

    const recentScoresQ = `
      SELECT ue.score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ORDER BY ue.attempted_at DESC
      LIMIT 6
    `;
    const recentScoresR = await db.query(
      recentScoresQ,
      orgId ? [userId, orgId] : [userId]
    );
    const scores = recentScoresR.rows.map((r) => Number(r.score));

    let improvementPercent = 0;
    if (scores.length >= 4) {
      const recent = scores.slice(0, 3);
      const previous = scores.slice(3);

      const avgRecent =
        recent.reduce((sum, s) => sum + s, 0) / recent.length;
      const avgPrev =
        previous.reduce((sum, s) => sum + s, 0) / previous.length;

      if (avgPrev > 0) {
        improvementPercent = Number(
          (((avgRecent - avgPrev) / avgPrev) * 100).toFixed(1)
        );
      }
    }

    return res.json({
      success: true,
      data: {
        averageScore: avgScore,
        highestScore,
        lowestScore,
        improvementPercent,
      },
    });
  } catch (err) {
    console.error("Analytics performance error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load performance metrics",
    });
  }
});


router.get("/analytics/ranks", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period = "all" } = query;
    const dateFilter = buildDateFilter(period);

    const rankQ = `
      SELECT
        ue.exam_id,
        ue.exam_rank,
        ue.attempted_at,
        e.exam_type
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      AND ue.exam_rank IS NOT NULL
      ${dateFilter}
      ORDER BY ue.attempted_at DESC
    `;
    const rankR = await db.query(
      rankQ,
      orgId ? [userId, orgId] : [userId]
    );
    const rows = rankR.rows;

    let averageRank = null;
    let lastExamRank = null;
    let recentExamRank = null;
    let practicalExamRank = null;

    if (rows.length) {
      const allRanks = rows.map((r) => Number(r.exam_rank));
      averageRank =
        allRanks.reduce((sum, v) => sum + v, 0) / allRanks.length;

      lastExamRank = Number(rows[0].exam_rank);

      const recent = rows.slice(0, 3).map((r) => Number(r.exam_rank));
      if (recent.length) {
        recentExamRank = Math.min(...recent); // best rank in last few exams
      }

      const practical = rows
        .filter((r) => String(r.exam_type).toUpperCase() === "PRACTICAL")
        .map((r) => Number(r.exam_rank));
      if (practical.length) {
        practicalExamRank =
          practical.reduce((sum, v) => sum + v, 0) / practical.length;
      }
    }

    return res.json({
      success: true,
      data: {
        averageRank,
        lastExamRank,
        recentExamRank,
        practicalExamRank,
      },
    });
  } catch (err) {
    console.error("Analytics rank error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load rank details" });
  }
});


router.get("/analytics/exams-chart", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId } = ctx;

    const q = `
      SELECT
        e.id,
        e.title,
        COALESCE(ue.score, 0) AS score
      FROM exams e
      LEFT JOIN user_exams ue
        ON ue.exam_id = e.id
        AND ue.user_id = $1
      WHERE e.is_active = TRUE
      ${orgId ? "AND e.organization_id = $2" : ""}
      ORDER BY e.start_time ASC NULLS LAST
      LIMIT 10
    `;
    const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

    const exams = r.rows.map((row) => ({
      examId: row.id,
      examTitle: row.title,
      score: Number(row.score),
    }));

    return res.json({
      success: true,
      data: exams,
    });
  } catch (err) {
    console.error("Analytics exams-chart error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load exam-wise chart",
    });
  }
});


router.get("/analytics/subjects-chart", async (req, res) => {
  try {
    const ctx = await verifyUserAndOrg(req, res);
    if (!ctx) return;

    const { userId, orgId, query } = ctx;
    const { period = "all" } = query;
    const dateFilter = buildDateFilter(period);

    const q = `
      SELECT
        e.subject,
        ROUND(AVG(ue.score), 2) AS avg_score
      FROM user_exams ue
      JOIN exams e ON e.id = ue.exam_id
      WHERE ue.user_id = $1
      ${orgId ? "AND e.organization_id = $2" : ""}
      ${dateFilter}
      GROUP BY e.subject
      ORDER BY e.subject
    `;
    const r = await db.query(q, orgId ? [userId, orgId] : [userId]);

    const subjects = r.rows.map((row) => ({
      subject: row.subject,
      averageScore: Number(row.avg_score),
    }));

    return res.json({
      success: true,
      data: subjects,
    });
  } catch (err) {
    console.error("Analytics subjects-chart error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load subject-wise performance",
    });
  }
});

module.exports = router;
