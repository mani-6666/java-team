const express = require("express");
const db = require("../config/database");
const router = express.Router();
//SUPER ADMIN DASHBOARD SUMMARY 
router.get("/summary", async (req, res) => {
  try {
    const totalClients = await db.query(
      `SELECT COUNT(*) AS total FROM organizations`
    );

    const totalUsers = await db.query(
      `SELECT COUNT(*) AS total FROM asi_users`
    );

    res.json({
      success: true,
      data: {
        totalClients: Number(totalClients.rows[0].total),
        activeSubscribers: 0,    
        totalUsers: Number(totalUsers.rows[0].total),
        totalRevenue: "$0",
        uptime: "99.99%",
        renewalRate: "88%"
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
      error: err.message
    });
  }
});
// ALL CLIENTS TABLE 
router.get("/clients", async (req, res) => {
  try {
    const orgs = await db.query(`
      SELECT org_id, name, description, created_at
      FROM organizations
      ORDER BY created_at DESC
    `);

    const clientData = [];

    for (const org of orgs.rows) {
      const userCount = await db.query(
        `SELECT COUNT(*) AS total FROM asi_users WHERE org_id = $1`,
        [org.org_id]
      );

      clientData.push({
        organization: org.name,
        subscriptionPlan: null, 
        users: Number(userCount.rows[0].total),
        exam: 0,                
        revenue: 0,              
        status: "Active",
        createdAt: org.created_at
      });
    }

    res.json({ success: true, data: clientData });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: err.message
    });
  }
});

// IMPERSONATE ADMIN USER
router.put("/impersonate-admin/:asi_id", async (req, res) => {
  try {
    const { asi_id } = req.params;
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email and Phone are required"
      });
    }

    // Update email in asi_users
    await db.query(
      `UPDATE asi_users SET email = $1 WHERE asi_id = $2`,
      [email, asi_id]
    );

    // Update full name & phone in asi_details
    await db.query(
      `UPDATE asi_details SET full_name = $1, phone = $2 WHERE asi_id = $3`,
      [fullName, phone, asi_id]
    );

    res.json({
      success: true,
      message: "Admin details updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update admin details",
      error: err.message
    });
  }
});
// MANAGE ORGANIZATIONS
router.put("/organization/update/:org_id", async (req, res) => {
  try {
    const { org_id } = req.params;
    const { fullName, description } = req.body;

    if (!fullName || !description) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Description are required"
      });
    }

    await db.query(
      `UPDATE organizations SET name = $1, description = $2 WHERE org_id = $3`,
      [fullName, description, org_id]
    );

    res.json({
      success: true,
      message: "Organization updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update organization",
      error: err.message
    });
  }
});

  //SUBSCRIPTIONS 
router.get("/subscriptions", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Subscription module not implemented yet"
  });
});
// USER ACTIVITY LOGS 
router.get("/activity", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "User activity logs not implemented"
  });
});
module.exports = router;