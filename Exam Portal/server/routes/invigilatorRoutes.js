const express = require("express");
const verifyToken = require("../authentication/verifyToken.js");
const { invigilatorDashboardRoutes } = require("../roles/invigilator_dashboard.js");
const invigilatorTask2Router = require("../roles/invigilator_dashboard_task2.js");

const router = express.Router();


router.get("/dashboard", verifyToken, invigilatorDashboardRoutes);


router.use("/", verifyToken, invigilatorTask2Router);

module.exports = router;