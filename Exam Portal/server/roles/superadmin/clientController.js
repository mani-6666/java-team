const express = require("express");
const db = require("../config/database");
const router = express.Router();

const calculateStatus = (start, end) => {
  const now = new Date();
  return now >= new Date(start) && now <= new Date(end)
    ? "Active"
    : "Inactive";
};

// CREATE CLIENT
router.post("/", async (req, res) => {
  try {
    const {
      organization,
      email,
      subscriptionPlan,
      subscriptionStart,
      subscriptionEnd,
      users,
      exam,
      revenue
    } = req.body;

    if (!organization || !email || !subscriptionPlan) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const emailCheck = await db.query(
      `SELECT id FROM clients WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const status = calculateStatus(subscriptionStart, subscriptionEnd);

    const result = await db.query(
      `INSERT INTO clients 
       (organization, email, subscriptionPlan, subscriptionStart, subscriptionEnd, users, exam, revenue, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        organization,
        email,
        subscriptionPlan,
        subscriptionStart,
        subscriptionEnd,
        users || 0,
        exam || 0,
        revenue || 0,
        status
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL CLIENTS (Search + Filter + Pagination)
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];
    let index = 1;

    if (search) {
      conditions.push(`(organization ILIKE $${index} OR email ILIKE $${index})`);
      values.push(`%${search}%`);
      index++;
    }

    if (status) {
      conditions.push(`status = $${index}`);
      values.push(status);
      index++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const dataQuery = `
      SELECT * FROM clients 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $${index} OFFSET $${index + 1}
    `;

    values.push(limit, offset);

    const result = await db.query(dataQuery, values);

    const countValues = values.slice(0, values.length - 2);

    const countQuery = `
      SELECT COUNT(*) FROM clients 
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, countValues);

    res.json({
      success: true,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE CLIENT
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM clients WHERE id = $1`,
      [req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE CLIENT
router.put("/:id", async (req, res) => {
  try {
    const {
      organization,
      subscriptionPlan,
      subscriptionStart,
      subscriptionEnd,
      users,
      exam,
      revenue
    } = req.body;

    const status = calculateStatus(subscriptionStart, subscriptionEnd);

    const result = await db.query(
      `UPDATE clients 
       SET organization=$1, subscriptionPlan=$2, subscriptionStart=$3, subscriptionEnd=$4,
           users=$5, exam=$6, revenue=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [
        organization,
        subscriptionPlan,
        subscriptionStart,
        subscriptionEnd,
        users,
        exam,
        revenue,
        status,
        req.params.id
      ]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE CLIENT
router.delete("/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);

    res.json({ success: true, message: "Client deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
