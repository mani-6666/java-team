const express = require("express");
const superAdminController = require("../controllers/superAdminDashboard");
const clientController = require("../controllers/clientController");
const verifyToken = require("../authentication/verifyToken");

const router = express.Router();

// ROLE CHECK (inline middleware)
const verifySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }
  next();
};

// Protect all super admin routes
router.use(verifyToken);
router.use(verifySuperAdmin);

// Routes
router.use("/dashboard", superAdminController);
router.use("/clients", clientController);

module.exports = router;
