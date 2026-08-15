import express from "express";
import * as MessController from "../Controllers/Mess.controller";

const router = express.Router();

router.get("/plan/pg/:pgId", MessController.getMessPlansByPgId);
router.post("/plan/add", MessController.createMessPlan);
router.delete("/plan/:id", MessController.deleteMessPlan);

router.post("/enroll", MessController.enrollMess);
router.get("/user/:userId", MessController.getUserMessEnrollment);
router.get("/enrollments/pg/:pgId", MessController.getPgMessEnrollments);

export default router;
