const client = require("../config/db");

const getDashboardCounts = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const totalUsersQuery = `
      SELECT COUNT(*) AS count
      FROM users
      WHERE organization_id = $1;
    `;
    const totalUsers = (await client.query(totalUsersQuery, [orgId])).rows[0].count;

    
    const onlineUsersQuery = `
      SELECT COUNT(*) AS count
      FROM user_sessions us
      JOIN users u ON u.id = us.user_id
      WHERE u.organization_id = $1 AND us.is_online = true;
    `;
    const onlineUsers = (await client.query(onlineUsersQuery, [orgId])).rows[0].count;

    
    const studyMaterialsQuery = `
      SELECT COUNT(*) AS count
      FROM study_materials
      WHERE organization_id = $1;
    `;
    const studyMaterials = (await client.query(studyMaterialsQuery, [orgId])).rows[0].count;


    const totalExamsQuery = `
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1;
    `;
    const totalExams = (await client.query(totalExamsQuery, [orgId])).rows[0].count;

    const activeExamsQuery = `
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'active';
    `;
    const activeExams = (await client.query(activeExamsQuery, [orgId])).rows[0].count;

    const scheduledExamsQuery = `
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'scheduled';
    `;
    const scheduledExams = (await client.query(scheduledExamsQuery, [orgId])).rows[0].count;

    const completedExamsQuery = `
      SELECT COUNT(*) AS count
      FROM exams
      WHERE organization_id = $1 AND status = 'completed';
    `;
    const completedExams = (await client.query(completedExamsQuery, [orgId])).rows[0].count;

    return res.json({
      totalUsers,
      onlineUsers,
      totalExams,
      activeExams,
      scheduledExams,
      completedExams,
      studyMaterials,
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {getDashboardCounts};
