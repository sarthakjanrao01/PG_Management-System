import express from "express";
import * as MaidController from "../Controllers/Maid.controller";

const router = express.Router();

// Maid Profile & Account
router.post("/add", MaidController.addMaid);
router.get("/owner/:ownerId", MaidController.getMaidsByOwner);
router.get("/user/:userId", MaidController.getMaidByUserId);

// Attendance
router.post("/attendance", MaidController.markAttendance);
router.get("/attendance/maid/:maidId", MaidController.getAttendanceByMaid);

// Tasks
router.post("/task/assign", MaidController.assignTask);
router.get("/task/maid/:maidId", MaidController.getTasksByMaid);
router.put("/task/:id", MaidController.updateTaskStatus);

// Salary Payouts
router.post("/salary/pay", MaidController.recordSalaryPayment);
router.get("/salary/maid/:maidId", MaidController.getSalaryHistoryByMaid);

export default router;
