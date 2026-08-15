import { RequestHandler } from "express";
import NotificationModel from "../Models/Notification.model";
import mongoose from "mongoose";

export const getNotificationsByRecipient: RequestHandler = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      res.status(400).json({ message: "Invalid Recipient ID" });
      return;
    }
    const notifications = await NotificationModel.find({ recipient_id: recipientId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotification: RequestHandler = async (req, res, next) => {
  try {
    const { recipient_id, sender_id, title, message, type } = req.body;
    if (!recipient_id || !title || !message) {
      res.status(422).json({ message: "Recipient ID, title, and message are required" });
      return;
    }

    const newNotification = new NotificationModel({
      recipient_id,
      sender_id: sender_id && mongoose.Types.ObjectId.isValid(sender_id) ? sender_id : null,
      title,
      message,
      type: type || "info",
      isRead: false,
    });

    const saved = await newNotification.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead: RequestHandler = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    await NotificationModel.updateMany({ recipient_id: recipientId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await NotificationModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const clearAllNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    await NotificationModel.deleteMany({ recipient_id: recipientId });
    res.status(200).json({ message: "All notifications cleared successfully" });
  } catch (error) {
    next(error);
  }
};
