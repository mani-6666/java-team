const express = require("express");
const db = require("../config/database");
const router = express.Router();
//create client
router.post("/", async (req, res) => {
  try {
    const {
      organizationName,
      organizationId,
      subscription,
      contactPerson,
      email,
      status
    } = req.body;

    if (!organizationName || !organizationId || !subscription || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }
    //email check
    const emailCheck = await db.query(
      `SELECT id FROM clients WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const insertQuery = `
      INSERT INTO clients 
      (organizationName, organizationId, subscription, contactPerson, email, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      organizationName,
      organizationId,
      subscription,
      contactPerson,
      email,
      status || "Active"
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET ALL CLIENTS
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];
    let index = 1;

    if (search) {
      conditions.push(
        `(organizationName ILIKE $${index} OR organizationId ILIKE $${index} OR email ILIKE $${index})`
      );
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
      SELECT id, organizationName, organizationId, subscription, contactPerson, email, status, createdAt
      FROM clients
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $${index} OFFSET $${index + 1}
    `;
    values.push(limit, offset);

    const result = await db.query(dataQuery, values);

    const countQuery = `SELECT COUNT(*) FROM clients ${whereClause}`;
    const countResult = await db.query(countQuery, values.slice(0, values.length - 2));

    res.json({
      success: true,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
      data: result.rows
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET SINGLE CLIENT
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM clients WHERE id = $1`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// UPDATE CLIENT
router.put("/:id", async (req, res) => {
  try {
    const {
      organizationName,
      organizationId,
      subscription,
      contactPerson,
      email,
      status
    } = req.body;

    const updateQuery = `
      UPDATE clients 
      SET organizationName=$1, organizationId=$2, subscription=$3,
          contactPerson=$4, email=$5, status=$6
      WHERE id=$7
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      organizationName,
      organizationId,
      subscription,
      contactPerson,
      email,
      status,
      req.params.id
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// DELETE CLIENT
router.delete("/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);

    res.json({
      success: true,
      message: "Client deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
