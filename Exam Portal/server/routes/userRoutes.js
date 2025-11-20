import express from "express";
import dashboardController from "../controllers/userDashboard.js";
import userExamsController from "../controllers/userExams.js";

const router = express.Router();

router.use("/", dashboardController);
router.use("/", userExamsController);

export default router;
    