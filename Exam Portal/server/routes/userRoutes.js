const express = require("express");
const verifyToken = require("../authentication/VerifyToken.js");

const dashboardController = require("../controllers/userDashboard.js");
const userExamsController = require("../controllers/userExams.js");

const router = express.Router();


router.use(
  "/",
  verifyToken,
  (req, res, next) => {
    if (!req.user || req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Access denied: USER role required",
      });
    }
    next();
  }
);


router.use("/", dashboardController);


router.use("/", userExamsController);

module.exports = router;
