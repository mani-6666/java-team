// controllers/profileController.js
const express = require("express");
const router = express.Router();
const db = require("../config/database");
const verifyToken = require("../authentication/verifyToken");

// Allowed fields per role
const PROFILE_FIELDS = {
  superadmin: ["full_name", "email", "phone", "gender", "age", "address"],
  admin: ["full_name", "email", "phone", "gender", "age", "address"],

  user: [
    "full_name",
    "email",
    "phone",
    "student_id",
    "organization",
    "department",
    "year",
    "enrollment_date",
  ],

  invigilator: [
    "full_name",
    "email",
    "phone",
    "invigilator_id",
    "organization",
    "department",
    "specialization",
    "join_date",
  ],
};


router.get("/profile", verifyToken, async (req, res) => {
  const { id, role } = req.user;

  const allowed = PROFILE_FIELDS[role];
  if (!allowed) {
    return res.status(400).json({ message: "Unknown role" });
  }

  try {
    const query = `
      SELECT ${allowed.join(", ")}
      FROM mainexamportal.asi_users
      WHERE asi_id = $1
    `;

    const result = await db.query(query, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      success: true,
      role,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  const { id, role } = req.user;
  const allowed = PROFILE_FIELDS[role];

  if (!allowed) {
    return res.status(400).json({ message: "Unknown role" });
  }

  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [field, val] of Object.entries(updates)) {
    setClauses.push(`${field} = $${idx++}`);
    values.push(val);
  }

  values.push(id); // WHERE ID

  const query = `
    UPDATE mainexamportal.asi_users
    SET ${setClauses.join(", ")}, updated_at = NOW()
    WHERE asi_id = $${idx}
    RETURNING ${allowed.join(", ")}
  `;

  try {
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: "Profile updated successfully",
      role,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
