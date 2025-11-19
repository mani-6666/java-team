import express from "express";
import db from "../config/db.js";

const router = express.Router();


function getUser(req) {
  return {
    userId: Number(req.headers["user-id"]) || null,
    orgId: Number(req.headers["org-id"]) || null,
    role: String(req.headers["user-role"] || "").toUpperCase()
  };
}


async function validateUserOrg(userId, orgId) {
  if (!orgId) return true; 

  const result = await db.query(
    `SELECT organization_id FROM users WHERE id = $1`,
    [userId]
  );

  if (!result.length) return false;
  return result[0].organization_id === orgId;
}




router.get("/dashboard/overview", async (req, res) => {
  try {
    const { userId, orgId, role } = getUser(req);

    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" });

    if (role !== "USER")
      return res.status(403).json({ success: false, message: "User access only" });

  
    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    const totalExams = await db.query(
      `SELECT COUNT(*) AS total_exams
       FROM exams
       WHERE ($1::int IS NULL OR organization_id = $1)`,
      [orgId]
    );


    const activeExams = await db.query(
      `SELECT COUNT(*) AS active_exams
       FROM exams
       WHERE start_time <= NOW()
       AND end_time >= NOW()
       AND ($1::int IS NULL OR organization_id = $1)`,
      [orgId]
    );


    const attempted = await db.query(
      `SELECT COUNT(DISTINCT exam_id) AS attempted_exams
       FROM user_exams
       WHERE user_id = $1`,
      [userId]
    );

    const avgScore = await db.query(
      `SELECT COALESCE(ROUND(AVG(score),2),0) AS avg_score
       FROM user_exams
       WHERE user_id = $1`,
      [userId]
    );


    const materials = await db.query(
      `SELECT COUNT(*) AS study_materials
       FROM study_materials
       WHERE ($1::int IS NULL OR organization_id = $1)`,
      [orgId]
    );

    return res.json({
      success: true,
      data: {
        totalExams: Number(totalExams[0]?.total_exams || 0),
        activeExams: Number(activeExams[0]?.active_exams || 0),
        attemptedExams: Number(attempted[0]?.attempted_exams || 0),
        remainingExams:
          Number(totalExams[0]?.total_exams || 0) -
          Number(attempted[0]?.attempted_exams || 0),
        averageScore: Number(avgScore[0]?.avg_score || 0),
        studyMaterials: Number(materials[0]?.study_materials || 0),
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
    const { userId, role } = getUser(req);

    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" });

    if (role !== "USER")
      return res.status(403).json({ success: false, message: "User access only" });

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
    return res.status(500).json({
      success: false,
      message: "Failed to load performance data",
      error: error.message,
    });
  }
});



router.get("/dashboard/upcoming-exams", async (req, res) => {
  try {
    const { userId, orgId, role } = getUser(req);

    if (role !== "USER")
      return res.status(403).json({ success: false, message: "User access only" });

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({ success: false, message: "Invalid organization access" });
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
    return res.status(500).json({
      success: false,
      message: "Failed to load upcoming exams",
      error: error.message,
    });
  }
});



router.get("/dashboard/achievements", async (req, res) => {
  try {
    const { userId, role } = getUser(req);

    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" });

    if (role !== "USER")
      return res.status(403).json({ success: false, message: "User access only" });

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
    return res.status(500).json({
      success: false,
      message: "Failed to load achievements",
      error: error.message,
    });
  }
});

export default router;
