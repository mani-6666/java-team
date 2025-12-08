const express = require("express");
const router = express.Router();
const {verifyToken}=require("../authentication/verifyToken");
const { getDashboardCounts } = require("../controllers/admin-dashboard");
const authorizeRole=require("../authentication/authorizeRole.js")

router.use(verifyToken);
router.use(authorizeRole('admin'));
router.get("/dashboard",getDashboardCounts);

module.exports = router;
