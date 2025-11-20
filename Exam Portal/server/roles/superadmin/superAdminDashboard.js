const express = require("express");
const db = require("../config/database");
const router = express.Router();

// DASHBOARD SUMMARY
router.get("/summary", async (req, res) => {
  try {
    const totalClientsResult = await db.query(`SELECT COUNT(*) FROM clients`);

    const activeSubscribersResult = await db.query(
      `SELECT COUNT(*) FROM clients WHERE status = 'Active'`
    );

    const totalRevenueResult = await db.query(
      `SELECT COALESCE(SUM(revenue), 0) AS total FROM clients`
    );

    return res.json({
      success: true,
      data: {
        totalClients: Number(totalClientsResult.rows[0].count),
        activeSubscribers: Number(activeSubscribersResult.rows[0].count),
        totalRevenue: Number(totalRevenueResult.rows[0].total),
        uptime: "99.99%",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
});

// CLIENT LIST FOR SUPER ADMIN
router.get("/clients", async (req, res) => {
  try {
    const clientsResult = await db.query(
      `SELECT organization, subscriptionplan, users, exam, revenue, status, createdat 
       FROM clients 
       ORDER BY createdat DESC`
    );

    return res.json({
      success: true,
      data: clientsResult.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
});

// SUBSCRIPTIONS LIST
router.get("/subscriptions", async (req, res) => {
  try {
    const subscriptionsResult = await db.query(
      `SELECT s.*, 
              c.organization AS client_organization,
              c.subscriptionplan AS client_subscription_plan
       FROM subscriptions s
       LEFT JOIN clients c ON s.clientid = c.id
       ORDER BY s.createdat DESC`
    );

    return res.json({
      success: true,
      data: subscriptionsResult.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load subscriptions",
      error: error.message,
    });
  }
});

// USER ACTIVITY LOGS
router.get("/activity", async (req, res) => {
  try {
    const logsResult = await db.query(
      `SELECT * FROM useractivity 
       ORDER BY timestamp DESC 
       LIMIT 20`
    );

    return res.json({
      success: true,
      data: logsResult.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user activity logs",
      error: error.message,
    });
  }
});

module.exports = router;
