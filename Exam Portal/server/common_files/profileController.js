const express = require("express");
const router = express.Router();
const db = require("../config/database");
const PROFILE_FIELDS = {
  superadmin: [
    "u.full_name",
    "u.email",
    "u.org_id",
    "d.mobile",
    "d.gender",
    "d.age",
  ],
  admin: [
    "u.full_name",
    "u.email",
    "u.org_id",
    "d.mobile",
    "d.gender",
    "d.age",
  ],
  user: [
    "u.full_name",
    "u.email",
    "u.org_id",
    "d.mobile",
    "d.age",
  ],
  invigilator: [
    "u.full_name",
    "u.email",
    "u.org_id",
    "d.mobile",
    "d.gender",
  ],
};
router.get("/profile", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id, role } = req.user;
  const fields = PROFILE_FIELDS[role];

  if (!fields) {
    return res.status(400).json({ message: "Unknown role" });
  }

  try {
    const query = `
      SELECT ${fields.join(", ")}
      FROM mainexamportal.asi_users u
      LEFT JOIN mainexamportal.asi_details d
        ON u.asi_id = d.asi_id
      WHERE u.asi_id = $1
        AND u.is_deleted = FALSE
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
router.put("/profile", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.user;

  const USER_FIELDS = ["full_name", "email", "org_id"];
  const DETAIL_FIELDS = ["mobile", "gender", "age"];

  const userUpdates = {};
  const detailUpdates = {};

  USER_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) userUpdates[f] = req.body[f];
  });

  DETAIL_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) detailUpdates[f] = req.body[f];
  });

  if (
    !Object.keys(userUpdates).length &&
    !Object.keys(detailUpdates).length
  ) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  try {
    if (Object.keys(userUpdates).length) {
      const set = Object.keys(userUpdates)
        .map((f, i) => `${f}=$${i + 1}`)
        .join(", ");

      await db.query(
        `
        UPDATE mainexamportal.asi_users
        SET ${set}
        WHERE asi_id = $${Object.keys(userUpdates).length + 1}
        `,
        [...Object.values(userUpdates), id]
      );
    }

    if (Object.keys(detailUpdates).length) {
      const set = Object.keys(detailUpdates)
        .map((f, i) => `${f}=$${i + 1}`)
        .join(", ");

      await db.query(
        `
        UPDATE mainexamportal.asi_details
        SET ${set}
        WHERE asi_id = $${Object.keys(detailUpdates).length + 1}
        `,
        [...Object.values(detailUpdates), id]
      );
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
