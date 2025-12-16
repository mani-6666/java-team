const pool = require("../../config/db");
const express = require("express");
const router = express.Router();

router.get("/stats/user-engagement", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const result = await pool.query(
      `
      SELECT
      (SELECT COUNT(DISTINCT user_id)
       FROM user_sessions us
       JOIN users u ON u.id = us.user_id
       WHERE u.org_id = $1
       AND us.last_seen >= NOW() - INTERVAL '1 day') AS daily_active_users,

      (SELECT COUNT(DISTINCT user_id)
       FROM user_sessions us
       JOIN users u ON u.id = us.user_id
       WHERE u.org_id = $1
       AND us.last_seen >= NOW() - INTERVAL '7 days') AS weekly_active_users,

      (SELECT COUNT(DISTINCT user_id)
       FROM user_sessions us
       JOIN users u ON u.id = us.user_id
       WHERE u.org_id = $1
       AND us.last_seen >= NOW() - INTERVAL '30 days') AS monthly_active_users,

      (
        (SELECT COUNT(DISTINCT user_id)
         FROM user_sessions us
         JOIN users u ON u.id = us.user_id
         WHERE u.org_id = $1
         AND us.last_seen >= NOW() - INTERVAL '30 days')
        * 100.0 /
        (SELECT COUNT(*) FROM users WHERE org_id = $1)
      ) AS engagement_rate
      `,
      [orgId]
    );

    res.json({ success: true, userStats: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/exams", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const result = await pool.query(
      `
      SELECT
      (SELECT COUNT(*) 
       FROM mainexamportal.exams 
       WHERE org_id=$1 AND is_deleted=false) AS total_exams_created,

      (SELECT COUNT(*) 
       FROM mainexamportal.exam_attempt er
       JOIN mainexamportal.exams e ON e.id = er.exam_id 
       WHERE e.org_id=$1) AS total_attempts,

      (
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE (SUM(CASE WHEN er.is_completed=true THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
          END
        FROM mainexamportal.exam_attempt er
        JOIN mainexamportal.exams e ON e.id = er.exam_id
        WHERE e.org_id=$1
      ) AS avg_completion_rate,

      (
        SELECT 
          CASE WHEN AVG(er.score) IS NULL THEN 0 ELSE AVG(er.score) END
        FROM mainexamportal.exam_attempt er
        JOIN mainexamportal.exams e ON e.id = er.exam_id
        WHERE e.org_id=$1
      ) AS avg_score
      `,
      [orgId]
    );

    res.json({ success: true, examStats: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/users", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const query = `
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'student') AS total_students,
        COUNT(*) FILTER (WHERE role = 'invigilator') AS total_invigilators,
        COUNT(*) FILTER (WHERE status = 'active') AS active_users
      FROM mainexamportal.asi_users
      WHERE org_id = $1 AND is_deleted = false;
    `;

    const result = await pool.query(query, [orgId]);

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching stats : ",err });
  }
});

module.exports=router;