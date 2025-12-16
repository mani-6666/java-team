const express = require("express");
const {verifyToken,authorizeRole} = require("../authentication/verifyToken.js");
const invigilatorDashboard = require('../roles/invigilator/invigilatorDashboard.js')
const analytics = require('../roles/invigilator/analytics.js')
const submissions = require('../roles/invigilator/student_submissions.js')
const updategrade = require('../roles/invigilator/updateGrade.js');
const router = express.Router();

router.use("/", verifyToken,authorizeRole('invigilator'));
router.use("/dashboard", verifyToken, invigilatorDashboard);
router.use('/submissions',verifyToken,submissions)
router.use('/updategrade',verifyToken,updategrade)
router.use('/analytics',verifyToken,analytics)




module.exports = router;