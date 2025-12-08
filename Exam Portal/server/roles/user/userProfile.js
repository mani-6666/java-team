const express = require("express");
const db = require("../config/db");

const router = express.Router();

/* ---------------------- GET CONTEXT ---------------------- */
function getContext(req) {
  return {
    userId: req.user?.id || null,
    role: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
  };
}

/* ---------------------- VALIDATE USER ORG ---------------------- */
async function validateUserOrg(userId, orgId) {
  if (!orgId) return true;

  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);

  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}


router.get("/profile", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res.status(403).json({ success: false, message: "USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    const q = `
      SELECT
        full_name,
        email,
        phone,
        student_id,
        organization_id,
        department,
        year,
        enrollment_date
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await db.query(q, [userId]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to load profile" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res.status(403).json({ success: false, message: "USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    const {
      full_name,
      phone,
      student_id,
      department,
      year,
      enrollment_date,
    } = req.body;

    if (!full_name || !phone || !student_id) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, and student ID are required",
      });
    }

    const q = `
      UPDATE users SET
        full_name = $1,
        phone = $2,
        student_id = $3,
        department = $4,
        year = $5,
        enrollment_date = $6
      WHERE id = $7
      RETURNING 
        full_name,
        email,
        phone,
        student_id,
        organization_id,
        department,
        year,
        enrollment_date;
    `;

    const values = [
      full_name,
      phone,
      student_id,
      department,
      year,
      enrollment_date,
      userId,
    ];

    const result = await db.query(q, values);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

module.exports = router;
