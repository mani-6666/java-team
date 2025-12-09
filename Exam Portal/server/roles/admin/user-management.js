const pool = require("../config/db");
const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const transporter = require("../config/mail");


router.post("/invigilators", async (req, res) => {

  try {
    const adminId = "56ca5a8a-3ad3-4466-ab21-b00f871fc462";
    const orgId ="ORG001";

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
    const passwordHash = await bcrypt.hash(rawPassword, 10);

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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Invigilator Account Credentials",
      html: `
        <h3>Welcome to ExamPortal!</h3>
        <p>Hello <b>${name}</b>,</p>
        <p>Your invigilator account has been created successfully.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${rawPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p>Regards,<br>ExamMarkPro Team</p>
      `
    });

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
    // const orgId = req.user.organizationId;
    const orgId="ORG001";
    const { search = "", status = "", role = "all" } = req.query;

    let query = `
      SELECT 
        id, name, email, status, enroll_date,
        age, gender, phone
      FROM mainexamportal.users_details
      WHERE organization_id = $1
    `;

    const params = [orgId];
    let i = 2;

    if (role !== "all") {
      query += ` AND role = $${i}`;
      params.push(role.toLowerCase());
      i++;
    }

    if (search) {
      query += ` AND (LOWER(name) LIKE $${i} OR LOWER(email) LIKE $${i})`;
      params.push(`%${search.toLowerCase()}%`);
      i++;
    }

    if (status) {
      query += ` AND status = $${i}`;
      params.push(status.toLowerCase());
      i++;
    }

    query += ` ORDER BY enroll_date DESC`;

    const result = await pool.query(query, params);

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
        id, name, email, role, status, enroll_date,
        age, gender, phone,
      FROM users
      WHERE id=$1 AND organization_id=$2
    `;

    const result = await pool.query(query, [userId, orgId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    let userData = {
      id: user.id,
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
      `SELECT role FROM users WHERE id=$1 AND organization_id=$2`,
      [userId, orgId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (check.rows[0].role === "admin") {
      return res.status(403).json({ message: "Admins cannot be deleted" });
    }

    await pool.query(
      `DELETE FROM users WHERE id=$1 AND organization_id=$2`,
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

// router.get("/stats/cards", async (req, res) => {
//   try {
//     const orgId = req.user.organizationId;

//     const stats = await pool.query(
//       `
//       SELECT
//         (SELECT COUNT(*) 
//          FROM users 
//          WHERE organization_id=$1) AS total_users,

//         (SELECT COUNT(*) 
//          FROM users 
//          WHERE organization_id=$1 AND role='student') AS students,

//         (SELECT COUNT(*) 
//          FROM users 
//          WHERE organization_id=$1 AND role='invigilator') AS invigilators,

//         (SELECT COUNT(DISTINCT us.user_id)
//           FROM user_sessions us
//           JOIN users u ON u.id = us.user_id
//           WHERE u.organization_id = $1
//           AND us.is_online = true
//         )  AS active_users
//       `,
//       [orgId]
//     );

//     const row = stats.rows[0];

//     res.json({
//       success: true,
//       cards: {
//         total_users: row.total_users,
//         total_students: row.students,
//         total_invigilators: row.invigilators,
//         active_users: row.active_users
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



module.exports = router;
