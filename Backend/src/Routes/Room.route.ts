import express from "express";
import * as RoomController from "../Controllers/Room.controller";

const router = express.Router();

router.get("/available", RoomController.getAllAvailableRooms);
router.get("/pg/:pgId", RoomController.getRoomsByPgId);
router.post("/add", RoomController.createRoom);
router.post("/create", RoomController.createRoom);
router.put("/:id", RoomController.updateRoom);
router.delete("/clear-all", RoomController.deleteAllRooms);
router.delete("/:id", RoomController.deleteRoom);

export default router;
