import express from "express";
import { getInvigilatorDashboard } from "../controllers/invigilator_dashboard.js";

const router = express.Router();

router.get("/dashboard", getInvigilatorDashboard);

export default router;
