const express = require("express");
const router = express.Router();
const { verifyToken }=require("../authentication/verifyToken");
const { getDashboardCounts } = require("../controllers/admin-dashboard");
const authorizeRole=require("../authentication/authorizeRole.js")
const createQuestions=require("../controllers/create-questions.js")
const examManagement=require("../controllers/exam-management.js")
const userManagement=require("../controllers/user-management.js")
const studyMaterial=require("../controllers/study-material.js")
const analytics=require("../controllers/analytics.js")


// router.use(verifyToken,authorizeRole('admin'));
router.get("/dashboard",getDashboardCounts);
router.use("/questions",createQuestions);
router.use("/exams",examManagement);
router.use("/users",userManagement);
router.use("/study",studyMaterial);
router.use("/analytics",analytics);

module.exports = router;
