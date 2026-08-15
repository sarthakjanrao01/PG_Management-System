import express from "express";
import * as OwnerDashboardController from "../Controllers/OwnerDashboard.controller";

const router = express.Router();

router.get("/analytics/:ownerId", OwnerDashboardController.getOwnerDashboardAnalytics);

export default router;
