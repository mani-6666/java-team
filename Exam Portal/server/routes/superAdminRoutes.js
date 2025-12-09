const express = require("express");

const superAdminController = require("../controllers/superAdminDashboard");
const clientController = require("../controllers/clientController");
const subscriptionController = require("../controllers/subscriptionController");
const analyticsController = require("../controllers/analyticsController");
const chatController = require("../controllers/chatController");
const profileController = require("../controllers/profileController");

const verifyToken = require("../authentication/verifyToken");

const router = express.Router();

// SUPERADMIN ONLY CHECK
const verifySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }
  next();
};

// 🔹 First apply JWT auth for all routes
router.use(verifyToken);

// 🔹 SUPERADMIN protected routes
router.use("/dashboard", verifySuperAdmin, superAdminController);
router.use("/clients", verifySuperAdmin, clientController);
router.use("/subscriptions", verifySuperAdmin, subscriptionController);
router.use("/analytics", verifySuperAdmin, analyticsController);
router.use("/chat", verifySuperAdmin, chatController.router);

// 🔹 Profile routes → accessible to ANY logged-in user
router.use("/", profileController);

module.exports = router;





// const express = require("express");

// const superAdminController = require("../controllers/superAdminDashboard");
// const clientController = require("../controllers/clientController");
// const subscriptionController = require("../controllers/subscriptionController");
// const analyticsController = require("../controllers/analyticsController");
// const profileController = require("../controllers/profileController");

// const router = express.Router();

// // SUPER ADMIN MODULE ROUTES
// router.use("/dashboard", superAdminController);
// router.use("/clients", clientController);
// router.use("/subscriptions", subscriptionController);
// router.use("/analytics", analyticsController);

// // router.use("/chat", chatController.router);

// // Profile routes (GET /profile, PUT /profile)
// router.use("/", profileController);

// module.exports = router;
