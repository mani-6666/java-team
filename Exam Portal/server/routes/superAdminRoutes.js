const express = require("express");

const superAdminController = require("../controllers/superAdminDashboard");
const clientController = require("../controllers/clientController");
const subscriptionController = require("../controllers/subscriptionController");
const analyticsController = require("../controllers/analyticsController");
const chatController = require("../controllers/chatController");
const profileController = require("../controllers/profileController");

const { verifyToken,authorizeRole } = require("../authentication/verifyToken");

const router = express.Router();
router.use(verifyToken,authorizeRole("superadmin"));

router.use("/dashboard", superAdminController);
router.use("/clients", clientController);
router.use("/subscriptions", subscriptionController);
router.use("/analytics", analyticsController);
router.use("/chat",chatController.router);
router.use("/", profileController);

module.exports = router;
