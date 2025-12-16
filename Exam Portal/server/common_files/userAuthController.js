const express = require("express");
const router = express.Router();
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const pool = require("../config/db.js");
const issueToken = require("../authentication/issueToken");
const { sendMail } = require("../utils/mailService");

const otpStore = new Map();     
const otpVerified = new Map();  



router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, organizationId, mobile, gender, age } = req.body;

    if (!fullName || !email || !password || !organizationId) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const emailCheck = await pool.query(
      `SELECT email FROM mainexamportal.users WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await hashPassword(password);
    const now = new Date();

  
    const userResult = await pool.query(
      `
      INSERT INTO mainexamportal.users 
      (email, password_hash, org_id, status, created_at, is_deleted)
      VALUES ($1, $2, $3, 'active', $4, false)
      RETURNING user_id
      `,
      [email, hashed, organizationId, now]
    );

    const user = userResult.rows[0];

  
    await pool.query(
      `
      INSERT INTO mainexamportal.user_details 
(user_id, name, mobile, age, gender, created_at, is_deleted)
VALUES ($1, $2, $3, $4, $5, $6, false)
      `,
      [
        user.user_id,
        fullName,
        mobile || null,
        age || null,
        gender || null,
        now
      ]
    );

    return res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

  
    if (loginType === "asi") {
      const asiResult = await pool.query(
        `SELECT asi_id, email, password_hash, status, role, org_id, is_deleted 
         FROM mainexamportal.asi_users 
         WHERE email = $1`,
        [email]
      );

      if (asiResult.rows.length > 0) {
        const asi = asiResult.rows[0];

        if (asi.is_deleted)
          return res.status(400).json({ message: "Account deleted" });

        if (asi.status !== "active")
          return res.status(403).json({ message: "Account inactive" });

        const match = await comparePassword(password, asi.password_hash);
       
        if (!match)
          return res.status(400).json({ message: "Invalid credentials" });

        const token = issueToken(res, {
          user_id: asi.asi_id,
          role: asi.role,
          org_id: asi.org_id
        });

        return res.json({
          message: "Login successful",
          token
        });
      }
    }

   
 const userResult = await pool.query(
  `SELECT user_id, email, password_hash, org_id, status, is_deleted 
   FROM mainexamportal.users 
   WHERE email = $1`,
  [email]
);


    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.is_deleted)
      return res.status(400).json({ message: "Account deleted" });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account inactive" });

    const match = await comparePassword(password, user.password_hash);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

  const token = issueToken(res, {
  user_id: user.user_id,
  role: "user",
  org_id: user.org_id
});


    return res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
  


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
      console.log("EMAIL RECEIVED FOR OTP:", email);  

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const check = await pool.query(
      `SELECT email FROM mainexamportal.users WHERE email=$1
       UNION
       SELECT email FROM mainexamportal.asi_users WHERE email=$1`,
      [email]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, otp);

   await sendMail(
  email,
  "Password Reset OTP",
  `
    <h2>Your OTP is <b>${otp}</b></h2>
    <p>This OTP expires in 5 minutes.</p>
  `
);


    return res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error("OTP SEND ERROR:", err.message);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/forgot-password/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    const savedOtp = otpStore.get(email);

 
    if (!savedOtp) {
      return res.status(400).json({
        message: "OTP expired or not sent",
        verified: false
      });
    }

    if (savedOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        verified: false
      });
    }

    otpVerified.set(email, true);
    otpStore.delete(email); 

    return res.json({
      message: "OTP verified",
      email,
      verified: true
    });
    
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      verified: false
    });
  }
});


router.post("/forgot-password/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;


    if (!otpVerified.get(email)) {
      return res.status(400).json({
        message: "OTP not verified. Please verify OTP first."
      });
    }

    const hashed = await hashPassword(newPassword, 10);

    
    await pool.query(
      `UPDATE mainexamportal.users SET password_hash=$1 WHERE email=$2`,
      [hashed, email]
    );

    await pool.query(
      `UPDATE mainexamportal.asi_users SET password_hash=$1 WHERE email=$2`,
      [hashed, email]
    );

    otpVerified.delete(email);

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;