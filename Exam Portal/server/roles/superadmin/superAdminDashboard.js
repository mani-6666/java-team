const express = require("express");
const db = require("../config/database");
const router = express.Router();
router.get("/summary", async (req, res) => {
  try {
    const totalClientsQuery = `SELECT COUNT(*) AS total FROM clients`;
    const userActivityQuery = `SELECT COUNT(*) AS total FROM useractivity`; 
    const activeSubscriptionsQuery = `SELECT COUNT(*) AS total FROM clients WHERE status = 'Active'`;

    const totalClients = await db.query(totalClientsQuery);
    const userActivity = await db.query(userActivityQuery);
    const activeSubscriptions = await db.query(activeSubscriptionsQuery);

    res.json({
      success: true,
      data: {
        totalClients: Number(totalClients.rows[0].total),
        userActivityCount: Number(userActivity.rows[0].total),
        activeSubscriptions: Number(activeSubscriptions.rows[0].total),
        uptime: "99.99%",
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
    const query = `
      SELECT 
        id,
        organization AS organization,
        subscriptionPlan AS subscriptionPlan,
        users,
        exam,
        revenue,
        status,
        createdAt
      FROM clients
      ORDER BY createdAt DESC
    `;

    const results = await db.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: err.message
    });
  }
});
router.get("/subscriptions", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*, 
        c.organization AS clientOrganization,
        c.subscriptionPlan AS plan
      FROM subscriptions s
      LEFT JOIN clients c ON s.clientId = c.id
      ORDER BY s.createdAt DESC
    `;
    const results = await db.query(query);

    res.json({
      success: true,
      data: results.rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load subscriptions",
      error: err.message
    });
  }
});

// USER ACTIVITY LOGS
router.get("/activity", async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM useractivity
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const logs = await db.query(query);

    res.json({
      success: true,
      data: logs.rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: err.message
    });
  }
});

module.exports = router;