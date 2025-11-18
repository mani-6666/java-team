// src/controllers/userAuthController.js
const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const issueToken = require("../middleware/issueToken");

// REGISTER USER (PURE SQL)
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, organizationId } = req.body;

    if (!fullName || !email || !password || !organizationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashed = await bcrypt.hash(password, 10);
const now = new Date();

    const result = await pool.query(
     ,
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

// LOGIN USER (PURE SQL)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
     ,
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
