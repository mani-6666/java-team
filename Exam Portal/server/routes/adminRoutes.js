const express = require("express");
const router = express.Router();
const { verifyToken,authorizeRole }=require("../authentication/verifyToken");
const { getDashboardCounts } = require("../roles/admin/admin-dashboard.js");
const createQuestions=require("../roles/admin/create-questions.js")
const examManagement=require("../roles/admin/exam-management.js")
const userManagement=require("../roles/admin/user-management.js")
const studyMaterial=require("../roles/admin/study-material.js")
const analytics=require("../roles/admin/analytics.js")


router.use("/",verifyToken,authorizeRole('admin'));
router.get("/dashboard",getDashboardCounts);
router.use("/questions",createQuestions);
router.use("/exams",examManagement);
router.use("/users",userManagement);
router.use("/study",studyMaterial);
router.use("/analytics",analytics);

module.exports = router;
