import express from "express";
import * as NotificationController from "../Controllers/Notification.controller";

const router = express.Router();

router.get("/recipient/:recipientId", NotificationController.getNotificationsByRecipient);
router.post("/create", NotificationController.createNotification);
router.put("/read/:id", NotificationController.markNotificationAsRead);
router.put("/read-all/:recipientId", NotificationController.markAllAsRead);

router.delete("/clear-all/:recipientId", NotificationController.clearAllNotifications);
router.delete("/:id", NotificationController.deleteNotification);

export default router;
