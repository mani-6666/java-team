import express from "express";
import superAdminController from "../controllers/superAdminDashboard.js";

const router = express.Router();
router.use("/dashboard", superAdminController);

export default router;
