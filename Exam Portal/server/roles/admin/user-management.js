const pool = require("../config/db");
const express = require("express");
const router = express.Router();

const bcrypt = require("../utils/bcrypt");
const {sendMail} = require("../utils/mailservice");



router.post("/invigilators", async (req, res) => {

  try {
    const adminId = req.user.id;
    const orgId =req.user.organizationId;

    const { name, email, mobile, gender, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    await pool.query("BEGIN");

    
    const exist = await pool.query(
      `SELECT asi_id FROM mainexamportal.asi_users WHERE email = $1 AND org_id = $2 AND is_deleted = false`,
      [email, orgId]
    );

    if (exist.rows.length > 0) {
      return res.status(400).json({ message: "User already exists in this organization" });
    }

    const rawPassword = generateRandomPassword(10);
    const passwordHash = await bcrypt.hashPassword(rawPassword);

    const userResult = await pool.query(
      `INSERT INTO mainexamportal.asi_users (email, password_hash, role, org_id, status, created_at, is_deleted)
       VALUES ($1, $2, 'invigilator', $3, 'active', NOW(), false)
       RETURNING asi_id, email, role`,
      [email, passwordHash, orgId]
    );

    const asiId = userResult.rows[0].asi_id;

    await pool.query(
      `INSERT INTO mainexamportal.asi_details (asi_id, name, mobile, age, gender, created_at, created_by, is_deleted)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, false)`,
      [asiId, name, mobile || null, age || null, gender || null, adminId]
    );

    await sendMail(
      email,
       "Your Invigilator Account Credentials",
       `
        <h3>Welcome to ExamPortal!</h3>
        <p>Hello <b>${name}</b>,</p>
        <p>Your invigilator account has been created successfully.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${rawPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p>Regards,<br>ExamMarkPro Team</p>
      `
    );

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Invigilator created successfully",
      data: {
        asi_id: asiId,
        name,
        email,
        role: "invigilator"
      }
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error creating invigilator" });
  }
});

router.get("/", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    let query = `
      SELECT u.user_id AS id, ud.name, u.email, ud.mobile, 'student' AS role FROM mainexamportal.users u 
      JOIN mainexamportal.user_details ud ON u.user_id = ud.user_id WHERE u.org_id = $1 AND u.is_deleted = false
       UNION ALL 
       SELECT au.asi_id AS id, ad.name, au.email, ad.mobile, au.role FROM mainexamportal.asi_users au 
       JOIN mainexamportal.asi_details ad ON au.asi_id = ad.asi_id WHERE au.org_id = $1 AND au.role = 'invigilator' AND au.is_deleted = false;`;

    const result = await pool.query(query,[orgId]);

    res.json({
      success: true,
      count: result.rowCount,
      users: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const userId = req.params.id;

    const query = `
      SELECT 
        user_id, name, email, role, status, enroll_date,
        age, gender, phone,
      FROM mainexamportal.users
      WHERE user_id=$1 AND org_id=$2
    `;

    const result = await pool.query(query, [userId, orgId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    let userData = {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      enrollDate: user.enroll_date,
      age: user.age,
      gender: user.gender,
      phone: user.phone
    };

    res.json({ success: true, data: userData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const userId = req.params.id;

    const check = await pool.query(
      `SELECT role FROM mainexamportal.users WHERE id=$1 AND org_id=$2`,
      [userId, orgId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (check.rows[0].role === "admin") {
      return res.status(403).json({ message: "Admins cannot be deleted" });
    }

    await pool.query(
      `DELETE FROM mainexamportal.users WHERE id=$1 AND org_id=$2`,
      [userId, orgId]
    );

    res.json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

module.exports = router;
