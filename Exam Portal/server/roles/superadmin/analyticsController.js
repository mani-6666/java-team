const express = require("express");
const db = require("../config/database");
const router = express.Router();
// REVENUE ANALYTICS 
router.get("/revenue", async (req, res) => {
  try {

    // Monthly Revenue + Transactions
    const revenueQuery = await db.query(`
      SELECT 
        TO_CHAR(os.start_date, 'Mon') AS month,
        SUM(sp.price) AS revenue,
        COUNT(*) AS transactions
      FROM organization_subscription os
      JOIN subscription_plans sp ON sp.plan_id = os.plan_id
      WHERE os.is_deleted = FALSE
      GROUP BY month
      ORDER BY MIN(os.start_date)
    `);

    // Subscription Distribution
    const distributionQuery = await db.query(`
      SELECT 
        sp.plan_name,
        COUNT(*) AS count
      FROM organization_subscription os
      JOIN subscription_plans sp ON sp.plan_id = os.plan_id
      WHERE os.is_active = TRUE AND os.is_deleted = FALSE
      GROUP BY sp.plan_name
    `);

    const distribution = {};
    distributionQuery.rows.forEach((d) => {
      distribution[d.plan_name] = Number(d.count);
    });

    res.json({
      success: true,
      monthlyRevenue: revenueQuery.rows,
      subscriptionTypes: distribution
      // examTrend → pending exam table confirmation
    });

  } catch (err) {
    console.error("REVENUE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// USERS ANALYTICS
router.get("/users", async (req, res) => {
  try {

    // Admin + Invigilator trend from asi_users
    const staffTrend = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) AS admin,
        SUM(CASE WHEN role='invigilator' THEN 1 ELSE 0 END) AS invigilator
      FROM asi_users
      GROUP BY month
      ORDER BY MIN(created_at)
    `);

    // Student trend from users
    const studentTrend = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*) AS students
      FROM users
      GROUP BY month
      ORDER BY MIN(created_at)
    `);

    // Merge trends
    const mergedTrend = staffTrend.rows.map(r => {
      const match = studentTrend.rows.find(s => s.month === r.month);
      return {
        month: r.month,
        admin: Number(r.admin),
        invigilator: Number(r.invigilator),
        users: match ? Number(match.students) : 0
      };
    });

    // Organization User Count
    const orgUsers = await db.query(`
      SELECT 
        o.name AS organization,
        COUNT(u.user_id) AS users
      FROM organizations o
      LEFT JOIN users u ON u.org_id = o.org_id
      GROUP BY o.name
      ORDER BY users DESC
    `);

    res.json({
      success: true,
      activeUsersTrend: mergedTrend,
      organizationUsers: orgUsers.rows
      // dailyLogins → pending login table confirmation
    });

  } catch (err) {
    console.error("USERS ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
