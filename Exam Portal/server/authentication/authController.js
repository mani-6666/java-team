
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/verifyToken");


router.post("/logout", verifyToken, (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


router.get("/profile/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
     ,
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
