const pool = require("../config/db");

const getDashboardCounts = async (req, res) => {
  try {
    // const orgId = req.user.organizationId;
    const orgId="ORG001";

    const activeUsers = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM mainexamportal.users
      WHERE organization_id = $1 AND status = 'active';
    `, [orgId])).rows[0].count;
    const onlineUsers = (await pool.query(`
      SELECT COUNT(DISTINCT us.user_id) AS count
      FROM user_sessions us
      JOIN users u ON u.id = us.user_id
      WHERE u.organization_id = $1
      AND us.is_online = true;
    `, [orgId])).rows[0].count;

    const studyMaterials = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM study_materials
      WHERE organization_id = $1 AND is_deleted = false;
    `, [orgId])).rows[0].count;

    const totalDownloads = (await pool.query(`
      SELECT COALESCE(SUM(download_count), 0) AS download_total
      FROM study_materials
      WHERE organization_id = $1 AND is_deleted = false;
    `, [orgId])).rows[0].download_total;

    const totalExams = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND is_deleted = false;
    `, [orgId])).rows[0].count;

    const activeExams = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'active' AND is_deleted = false;
    `, [orgId])).rows[0].count;

    const scheduledExams = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'upcoming' AND is_deleted = false;
    `, [orgId])).rows[0].count;
    const completedExams = (await pool.query(`
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'completed' AND is_deleted = false;
    `, [orgId])).rows[0].count;

    const avgPerfData = (await pool.query(`
      SELECT 
        COALESCE(SUM(obtained_score), 0) AS total_obtained,
        COALESCE(SUM(total_score), 0) AS total_possible
      FROM exam_attempts
      WHERE organization_id = $1;
    `, [orgId])).rows[0];

    let avgPerformance = 0;
    if (avgPerfData.total_possible > 0) {
      avgPerformance =
        (avgPerfData.total_obtained / avgPerfData.total_possible) * 100;
    }

    const lastMonthPerfData = (await pool.query(`
      SELECT 
        COALESCE(SUM(obtained_score), 0) AS total_obtained,
        COALESCE(SUM(total_score), 0) AS total_possible
      FROM exam_attempts
      WHERE organization_id = $1
      AND attempt_date >= NOW() - INTERVAL '30 days';
    `, [orgId])).rows[0];

    let lastMonthPerformance = 0;
    if (lastMonthPerfData.total_possible > 0) {
      lastMonthPerformance =
        (lastMonthPerfData.total_obtained /
          lastMonthPerfData.total_possible) *
        100;
    }

    const performanceChange = avgPerformance - lastMonthPerformance;

    const recentExams = (await pool.query(`
      SELECT id, title, type, status,duration,questions, start_date, end_date
      FROM exams
      WHERE organization_id = $1 AND is_deleted = false
      ORDER BY start_date DESC
      LIMIT 4;
    `, [orgId])).rows;

    return res.json({
      success: true,
      cards: {
        active_users: activeUsers,
        online_users: onlineUsers,
        study_materials: studyMaterials,
        total_downloads: totalDownloads,
        total_exams: totalExams,
        active_exams: activeExams,
        scheduled_exams: scheduledExams,
        completed_exams: completedExams,
        avg_performance: avgPerformance,
        performance_change: performanceChange
      },
      recent_exams: recentExams
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardCounts };