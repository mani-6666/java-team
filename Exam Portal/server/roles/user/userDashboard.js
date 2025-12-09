
const express = require("express");
const db = require("../config/db.js");

const router = express.Router();



function getUserFromReq(req) {
  return {
    userId: req.user && req.user.id ? Number(req.user.id) : null,
    orgId:
      req.user && (req.user.organizationId || req.user.organization_id)
        ? Number(req.user.organizationId || req.user.organization_id)
        : null,
    role: req.user && req.user.role ? String(req.user.role).toUpperCase() : null,
  };
}

async function validateUserOrg(userId, orgId) {
  if (!orgId) return false;

  const result = await db.query(
    `SELECT organization_id FROM users WHERE id = $1`,
    [userId]
  );

  if (!result || !result.length) return false;
  return Number(result[0].organization_id) === Number(orgId);
}


router.get("/dashboard/overview", async (req, res) => {
  try {
    const { userId, orgId, role } = getUserFromReq(req);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing user (auth required)" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER only" });
    }

    const belongs = await validateUserOrg(userId, orgId);
    if (!belongs) {
      return res
        .status(403)
        .json({ success: false, message: "User does not belong to this organization" });
    }

  
    const [
      totalExamsRows,
      activeExamsRows,
      attemptedRows,
      avgScoreRows,
      materialsRows,
    ] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total_exams
         FROM exams
         WHERE ($1::int IS NULL OR organization_id = $1)`,
        [orgId]
      ),
      db.query(
        `SELECT COUNT(*) AS active_exams
         FROM exams
         WHERE start_time <= NOW()
           AND end_time >= NOW()
           AND ($1::int IS NULL OR organization_id = $1)`,
        [orgId]
      ),
      db.query(
        `SELECT COUNT(DISTINCT exam_id) AS attempted_exams
         FROM user_exams
         WHERE user_id = $1`,
        [userId]
      ),
      db.query(
        `SELECT COALESCE(ROUND(AVG(score),2),0) AS avg_score
         FROM user_exams
         WHERE user_id = $1`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*) AS study_materials
         FROM study_materials
         WHERE ($1::int IS NULL OR organization_id = $1)`,
        [orgId]
      ),
    ]);

    const totalExams = Number(totalExamsRows[0]?.total_exams || 0);
    const activeExams = Number(activeExamsRows[0]?.active_exams || 0);
    const attemptedExams = Number(attemptedRows[0]?.attempted_exams || 0);
    const averageScore = Number(avgScoreRows[0]?.avg_score || 0);
    const studyMaterials = Number(materialsRows[0]?.study_materials || 0);

    return res.json({
      success: true,
      data: {
        totalExams,
        activeExams,
        attemptedExams,
        remainingExams: Math.max(0, totalExams - attemptedExams),
        averageScore,
        studyMaterials,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
});

router.get("/dashboard/performance", async (req, res) => {
  try {
    const { userId, role } = getUserFromReq(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid or missing user" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER only" });
    }

    const performance = await db.query(
      `SELECT DATE(created_at) AS date,
              ROUND(AVG(score), 2) AS avg_score
       FROM user_exams
       WHERE user_id = $1
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`,
      [userId]
    );

    return res.json({ success: true, data: performance });
  } catch (error) {
    console.error("Dashboard performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load performance data",
      error: error.message,
    });
  }
});


router.get("/dashboard/upcoming-exams", async (req, res) => {
  try {
    const { userId, orgId, role } = getUserFromReq(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid or missing user" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER only" });
    }

    const belongs = await validateUserOrg(userId, orgId);
    if (!belongs) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid organization access" });
    }

    const exams = await db.query(
      `SELECT id, title, start_time, difficulty
       FROM exams
       WHERE start_time >= NOW()
         AND ($1::int IS NULL OR organization_id = $1)
       ORDER BY start_time ASC
       LIMIT 5`,
      [orgId]
    );

    return res.json({ success: true, data: exams });
  } catch (error) {
    console.error("Upcoming exams error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load upcoming exams",
      error: error.message,
    });
  }
});


router.get("/dashboard/achievements", async (req, res) => {
  try {
    const { userId, role } = getUserFromReq(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid or missing user" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER only" });
    }

    const achievements = await db.query(
      `SELECT id, title, description, created_at
       FROM achievements
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    return res.json({ success: true, data: achievements });
  } catch (error) {
    console.error("Achievements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load achievements",
      error: error.message,
    });
  }
});

module.exports = router;
