const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const pool = require("../../config/db.js");
const issueToken = require("../authentication/issueToken"); // ✅ Correct import


/* ==========================================================
    REGISTER
========================================================== */
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const { fullName, email, password, organizationId, mobile, gender } = req.body;

    if (!fullName || !email || !password || !organizationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await client.query('BEGIN');

    const hashed = await bcrypt.hash(password, 10);

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users (email, password_hash, org_id)
      VALUES ($1, $2, $3)
      RETURNING user_id, email, org_id
      `,
      [email, hashed, organizationId]
    );

    const user = userResult.rows[0];

    // Insert into user_details with matching user_id
    await client.query(
      `
      INSERT INTO user_details (user_id, name, mobile, gender)
      VALUES ($1, $2, $3, $4)
      `,
      [user.user_id, fullName, mobile || null, gender || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: user.user_id,
        fullName,
        email,
        mobile,
        gender,
        organizationId,
      },
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});



/* ==========================================================
    LOGIN
========================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    /* --------------------- ASI Login -------------------- */
    if (loginType === "asi") {
      const asiResult = await pool.query(
        `SELECT * FROM asi_users WHERE email = $1`,
        [email]
      );

      if (asiResult.rows.length > 0) {
        const asi = asiResult.rows[0];

        if (asi.status !== "active") {
          return res.status(403).json({ message: "Account inactive" });
        }

        const match = await bcrypt.compare(password, asi.password_hash);
        if (!match) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = issueToken(res, {
          user_id: asi.asi_id,
          role: asi.role,
          org_id: asi.org_id,
        });

        return res.json({
          message: "Login successful (ASI)",
          token,
          user: {
            id: asi.asi_id,
            email: asi.email,
            role: asi.role,
            organizationId: asi.org_id,
            type: "asi_user",
          },
        });
      }
    }

    /* --------------------- Normal User Login -------------------- */
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = issueToken(res, {
      user_id: user.user_id,
      role: 'user',
      org_id: user.org_id,
    });

    const details = await pool.query(
      `SELECT name, mobile, gender FROM user_details WHERE user_id = $1`,
      [user.user_id]
    );

    const profile = details.rows[0] || {};

    return res.json({
      message: "Login successful (Normal User)",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: 'user',
        organizationId: user.org_id,
        name: profile.name,
        mobile: profile.mobile,
        gender: profile.gender,
        type: "normal_user",
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
