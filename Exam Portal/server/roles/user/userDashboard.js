import express from "express";
import db from "../config/db.js";
import { protect } from "../utils/authmiddleWare.js";

const router = express.Router();


router.get("/dashboard/overview", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.organizationId || null;

    // Total Exams
    const totalExamsResult = await db.query(
      `
      SELECT COUNT(*) AS total_exams
      FROM exams
      ${orgId ? "WHERE organization_id = $1" : ""}
      `,
      orgId ? [orgId] : []
    );

    // Active Exams
    const activeExamsResult = await db.query(
      `
      SELECT COUNT(*) AS active_exams
      FROM exams
      WHERE start_time <= NOW()
      AND end_time >= NOW()
      ${orgId ? "AND organization_id = $1" : ""}
      `,
      orgId ? [orgId] : []
    );

    // Attempted Exams
    const attemptedResult = await db.query(
      `
      SELECT COUNT(DISTINCT exam_id) AS attempted_exams
      FROM user_exams
      WHERE user_id = $1
      `,
      [userId]
    );

    // Average Score
    const avgScoreResult = await db.query(
      `
      SELECT COALESCE(ROUND(AVG(score), 2), 0) AS avg_score
      FROM user_exams
      WHERE user_id = $1
      `,
      [userId]
    );

    // Study Materials
    const materialsResult = await db.query(
      `
      SELECT COUNT(*) AS study_materials
      FROM study_materials
      ${orgId ? "WHERE organization_id = $1" : ""}
      `,
      orgId ? [orgId] : []
    );

    return res.json({
      success: true,
      data: {
        totalExams: Number(totalExamsResult.rows[0]?.total_exams || 0),
        activeExams: Number(activeExamsResult.rows[0]?.active_exams || 0),
        attemptedExams: Number(attemptedResult.rows[0]?.attempted_exams || 0),
        remainingExams:
          Number(totalExamsResult.rows[0]?.total_exams || 0) -
          Number(attemptedResult.rows[0]?.attempted_exams || 0),
        averageScore: Number(avgScoreResult.rows[0]?.avg_score || 0),
        studyMaterials: Number(materialsResult.rows[0]?.study_materials || 0)
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
});


router.get("/dashboard/performance", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const performanceResult = await db.query(
      `
      SELECT DATE(created_at) AS date, ROUND(AVG(score), 2) AS avg_score
      FROM user_exams
      WHERE user_id = $1
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,
      [userId]
    );

    return res.json({
      success: true,
      data: performanceResult.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load performance data",
      error: error.message,
    });
  }
});


router.get("/dashboard/upcoming-exams", protect, async (req, res) => {
  try {
    const orgId = req.user.organizationId || null;

    const upcomingResult = await db.query(
      `
      SELECT id, title, start_time, difficulty
      FROM exams
      WHERE start_time >= NOW()
      ${orgId ? "AND organization_id = $1" : ""}
      ORDER BY start_time ASC
      `,
      orgId ? [orgId] : []
    );

    return res.json({
      success: true,
      data: upcomingResult.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load upcoming exams",
      error: error.message,
    });
  }
});

router.get("/dashboard/achievements", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const achievementsResult = await db.query(
      `
      SELECT id, title, description, created_at
      FROM achievements
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [userId]
    );

    return res.json({
      success: true,
      data: achievementsResult.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load achievements",
      error: error.message,
    });
  }
});

export default router;
