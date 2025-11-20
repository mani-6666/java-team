
const express = require("express");
const router = express.Router();
const pool = require("../dbconfig/db");
const verifyToken = require("../authentication/verifyToken");


router.post("/logout", verifyToken, (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


router.get("/profile/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, "fullName", email, role, "organizationId"
       FROM "Users"
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
