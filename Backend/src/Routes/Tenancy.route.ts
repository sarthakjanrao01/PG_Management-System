import express from "express";
import * as TenancyController from "../Controllers/Tenancy.controller";

const router = express.Router();

router.post("/allot", TenancyController.allotRoom);
router.get("/pg/:pgId", TenancyController.getTenantsByPgId);
router.get("/room/:roomId", TenancyController.getTenantsByRoomId);
router.get("/user/:userId", TenancyController.getTenancyByUserId);
router.put("/vacate/:id", TenancyController.vacateTenant);

export default router;
