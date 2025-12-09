const express = require("express");
const verifyToken = require("../authentication/VerifyToken.js");
<<<<<<< HEAD

const dashboardController = require("../controllers/userDashboard.js");
const userExamsController = require("../controllers/userExams.js");
const studyMaterialsController = require("../controllers/studyMaterials.js");
=======
>>>>>>> 77ac060adecf329e4c33f84bb3a3d67d0934e3eb

const dashboardController = require("../controllers/userDashboard.js");
const userExamsController = require("../controllers/userExams.js");
const studyMaterialsController = require("../controllers/studyMaterials.js");
const userAnalyticsController = require("../controllers/userAnalytics.js");
const userAchievementsController = require("../controllers/userAchievements.js");
const userProfileController = require("../controllers/userProfile.js");
const userChatboxController = require("../controllers/userChatbox");
const router = express.Router();

<<<<<<< HEAD

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
router.use("/", studyMaterialsController); 

module.exports = router;
=======

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


router.use("/", studyMaterialsController);


router.use("/", userAnalyticsController);
router.use("/", userAchievementsController);
router.use("/", userProfileController);
router.use("/", userChatboxController);



module.exports = router;

>>>>>>> 77ac060adecf329e4c33f84bb3a3d67d0934e3eb
