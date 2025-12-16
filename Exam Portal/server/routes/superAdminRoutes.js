const express = require("express");

const superAdminController = require("../roles/superadmin/superAdminDashboard.js");
const clientController = require("../roles/superadmin/clientController");
const subscriptionController = require("../roles/superadmin/subscriptionController");
const analyticsController = require("../roles/superadmin/analyticsController");
const chatController = require("../roles/superadmin/chatController");
const profileController = require("../roles/superadmin/profileController");

const {verifyToken, authorizeRole} = require("../authentication/verifyToken");

const router = express.Router();

// SUPERADMIN ONLY CHECK
// const verifySuperAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "superadmin") {
//     return res.status(403).json({ message: "Access denied. Super Admin only." });
//   }
//   next();
// };

// 🔹 First apply JWT auth for all routes
router.use("/",verifyToken,authorizeRole('superadmin'));

// 🔹 SUPERADMIN protected routes
router.use("/dashboard",  superAdminController);
router.use("/clients",  clientController);
router.use("/subscriptions",  subscriptionController);
router.use("/analytics",  analyticsController);
router.use("/chat",  chatController.router);

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
