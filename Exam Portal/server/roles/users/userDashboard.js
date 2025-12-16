
const express = require("express");
const db = require("../../config/db.js");

const router = express.Router();



function getUser(req) {
  return {
    userId: req.user?.id ? Number(req.user.id) : null,
    orgId:
      req.user?.organizationId || req.user?.organization_id
        ? Number(req.user.organizationId || req.user.organization_id)
        : null,
    role: req.user?.role ? String(req.user.role).toUpperCase() : null,
  };
}

async function validateUserOrg(userId, orgId) {
  if (!orgId) return false;

  const result = await db.query(
    `SELECT organization_id FROM users WHERE id = $1`,
    [userId]
  );

  if (!result.rows.length) return false;

  return Number(result.rows[0].organization_id) === Number(orgId);
}



router.get("/dashboard/overview", async (req, res) => {
  try {
    const { userId, orgId, role } = getUser(req);

    if (!userId) return res.status(400).json({ success: false, message: "User not authenticated" });
    if (role !== "USER") return res.status(403).json({ success: false, message: "USER only access" });

    const belongs = await validateUserOrg(userId, orgId);
    if (!belongs) return res.status(403).json({ success: false, message: "Invalid organization access" });

    const [
      totalExamsResult,
      activeExamsResult,
      attemptedResult,
      scoreResult,
      materialsResult,
    ] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total_exams 
         FROM exams 
         WHERE is_active = TRUE AND organization_id = $1`,
        [orgId]
      ),

      db.query(
        `SELECT COUNT(*) AS active_exams
         FROM exams
         WHERE start_time <= NOW()
           AND end_time >= NOW()
           AND is_active = TRUE
           AND organization_id = $1`,
        [orgId]
      ),

      db.query(
        `SELECT COUNT(DISTINCT exam_id) AS attempted_exams
         FROM user_exams
         WHERE user_id = $1`,
        [userId]
      ),

      db.query(
        `SELECT COALESCE(ROUND(AVG(score), 2), 0) AS average_score
         FROM user_exams
         WHERE user_id = $1`,
        [userId]
      ),

      db.query(
        `SELECT COUNT(*) AS study_materials
         FROM study_materials
         WHERE organization_id = $1`,
        [orgId]
      ),
    ]);

    const totalExams = Number(totalExamsResult.rows[0].total_exams);
    const activeExams = Number(activeExamsResult.rows[0].active_exams);
    const attempted = Number(attemptedResult.rows[0].attempted_exams);
    const averageScore = Number(scoreResult.rows[0].average_score);
    const studyMaterials = Number(materialsResult.rows[0].study_materials);

    return res.json({
      success: true,
      data: {
        totalExams,
        activeExams,
        attempted,
        remainingExams: Math.max(0, totalExams - attempted), // FIXED: correct remaining logic
        averageScore,
        studyMaterials,
      },
    });
  } catch (error) {
    console.error("Dashboard Overview Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard overview" });
  }
});



router.get("/dashboard/performance", async (req, res) => {
  try {
    const { userId, role } = getUser(req);

    if (!userId) return res.status(400).json({ success: false, message: "User not authenticated" });
    if (role !== "USER") return res.status(403).json({ success: false, message: "USER only access" });

    const points = await db.query(
      `SELECT 
          DATE(attempted_at) AS date,
          ROUND(AVG(score), 2) AS avg_score
       FROM user_exams
       WHERE user_id = $1
       GROUP BY DATE(attempted_at)
       ORDER BY DATE(attempted_at) ASC`,
      [userId]
    );

    return res.json({
      success: true,
      data: points.rows.map(row => ({
        date: row.date,
        score: Number(row.avg_score),
      })),
    });
  } catch (error) {
    console.error("Performance Graph Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load performance graph" });
  }
});



router.get("/dashboard/upcoming-exams", async (req, res) => {
  try {
    const { userId, orgId, role } = getUser(req);

    if (!userId) return res.status(400).json({ success: false, message: "User not authenticated" });
    if (role !== "USER") return res.status(403).json({ success: false, message: "USER only access" });

    const belongs = await validateUserOrg(userId, orgId);
    if (!belongs) return res.status(403).json({ success: false, message: "Invalid organization access" });

    const exams = await db.query(
      `SELECT 
          id,
          title,
          start_time,
          exam_mode
       FROM exams
       WHERE start_time > NOW()
         AND is_active = TRUE
         AND organization_id = $1
       ORDER BY start_time ASC
       LIMIT 5`,
      [orgId]
    );

    return res.json({
      success: true,
      data: exams.rows.map(exam => ({
        id: exam.id,
        title: exam.title,
        date: exam.start_time,
        tag: exam.exam_mode?.toUpperCase() === "CODING" ? "Coding" : "MCQs",
      })),
    });
  } catch (error) {
    console.error("Upcoming Exams Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load upcoming exams" });
  }
});



router.get("/dashboard/achievements", async (req, res) => {
  try {
    const { userId, role } = getUser(req);

    if (!userId) return res.status(400).json({ success: false, message: "User not authenticated" });
    if (role !== "USER") return res.status(403).json({ success: false, message: "USER only access" });

    const achievements = await db.query(
      `SELECT 
          id,
          title,
          description,
          created_at
       FROM achievements
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    return res.json({
      success: true,
      data: achievements.rows,
    });
  } catch (error) {
    console.error("Achievements Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load achievements" });
  }
});

module.exports = router;
