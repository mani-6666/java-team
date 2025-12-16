const express = require("express");
const router = express.Router();

const {verifyToken,authorizeRole} = require("../authentication/verifyToken.js");

// ======================== Controllers ========================

// 🔓 Public (No token required)
// const userAuthController = require("../common_files/userAuthController.js"); 
// /auth/register  /auth/login

// 🔐 Private (Login + USER role required)
const dashboardController = require("../roles/users/userDashboard.js");
const userExamsController = require("../roles/users/userExams.js");
const studyMaterialsController = require("../roles/users/studyMaterials.js");
const userAnalyticsController = require("../roles/users/userAnalytics.js");
const userAchievementsController = require("../roles/users/userAchievements.js");
//const userProfileController = require("../controllers/userProfile.js");
// const userChatboxController = require("../controllers/userChatbox.js");


// ========================================================================
// 🔓 PUBLIC ROUTES (Register + Login)
// ========================================================================
// router.use("/auth", userAuthController);  
// → POST /auth/register
// → POST /auth/login


// ========================================================================
// 🔐 PROTECTED ROUTES (Token required + USER role only)
// ========================================================================
// router.use(
//   "/",
//   verifyToken,
//   (req, res, next) => {
//     const userRole = String(req.user.role || '').toUpperCase();
//     if (userRole !== "USER") {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied: USER role required",
//       });
//     }
//     next();
//   }
// );


// ========================================================================
// 📌 USER ROUTES (PROTECTED AREA)
// ========================================================================

// Dashboard APIs
router.use("/",verifyToken,authorizeRole('user'));
router.use("/", dashboardController);

// Exams APIs
router.use("/", userExamsController);

// Study Materials APIs
router.use("/", studyMaterialsController);

// Analytics APIs
router.use("/", userAnalyticsController);

// Achievements APIs
router.use("/", userAchievementsController);

// User Profile + Logout
//router.use("/", userProfileController);

// Chatbox APIs (optional)
// router.use("/", userChatboxController);


module.exports = router;
