import express from "express";
import dashboardController from "../controllers/userDashboard.js";

const router = express.Router();

router.use("/", dashboardController);

export default router;
