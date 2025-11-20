
const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const pool = require("../dbconfig/db");
const issueToken = require("../authentication/issueToken");


router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, organizationId } = req.body;

    if (!fullName || !email || !password || !organizationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashed = await bcrypt.hash(password, 10);
const now = new Date();

    const result = await pool.query(
      `INSERT INTO "Users"
       ("fullName", email, password, role, "organizationId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'user', $4, $5, $6)
       RETURNING id, "fullName", email, role, "organizationId"`,
      [fullName, email, hashed, organizationId, now, now]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM "Users" WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = issueToken(res, user);

    res.json({
      message: "User login successful",
      token,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
