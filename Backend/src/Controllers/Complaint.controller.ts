import { RequestHandler } from "express";
import ComplaintModel from "../Models/Complaint.model";
import PgModel from "../Models/Pg.model";
import NotificationModel from "../Models/Notification.model";
import RegisterModel from "../Models/Register.model";
import mongoose from "mongoose";

export const createComplaint: RequestHandler = async (req, res, next) => {
  try {
    const { user_id, pg_id, room_id, category, title, description } = req.body;
    if (!user_id || !category || !title || !description) {
      res.status(422).json({ message: "Required complaint fields missing" });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const complaintData: any = {
      user_id,
      category,
      title,
      description,
      status: "Open",
      user_reviewed: false,
    };

    if (pg_id && mongoose.Types.ObjectId.isValid(pg_id)) {
      complaintData.pg_id = pg_id;
    } else {
      const defaultPg = await PgModel.findOne();
      if (defaultPg) complaintData.pg_id = defaultPg._id;
    }

    if (room_id && mongoose.Types.ObjectId.isValid(room_id)) {
      complaintData.room_id = room_id;
    }

    const complaint = new ComplaintModel(complaintData);
    const saved = await complaint.save();

    // Send Notification to PG Owner(s)
    try {
      const ownerIds = new Set<string>();
      
      if (complaintData.pg_id) {
        const pg = await PgModel.findById(complaintData.pg_id);
        if (pg && pg.reg_id) ownerIds.add(String(pg.reg_id));
      }

      const owners = await RegisterModel.find({ role: { $regex: /owner/i } });
      owners.forEach((o) => ownerIds.add(String(o._id)));

      for (const ownerId of ownerIds) {
        const notif = new NotificationModel({
          recipient_id: ownerId,
          sender_id: user_id,
          title: `New Maintenance Complaint: ${title}`,
          message: `Category: ${category}. ${description}`,
          type: "complaint_created",
          isRead: false,
        });
        await notif.save();
      }
    } catch (notifErr) {
      console.warn("Notification dispatch to owner failed:", notifErr);
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error in createComplaint:", error);
    next(error);
  }
};

export const getComplaintsByUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const complaints = await ComplaintModel.find({ user_id: userId }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    next(error);
  }
};

export const getComplaintsByPg: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    let matchQuery: Record<string, unknown> = {};
    if (pgId !== "all" && mongoose.Types.ObjectId.isValid(pgId)) {
      matchQuery = { pg_id: new mongoose.Types.ObjectId(pgId) };
    }
    const complaints = await ComplaintModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "registers",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "roomDetail",
        },
      },
      {
        $lookup: {
          from: "maids",
          localField: "assigned_maid_id",
          foreignField: "_id",
          as: "maidDetail",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(complaints);
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assigned_maid_id, resolution_note, owner_id } = req.body;
    const updated = await ComplaintModel.findByIdAndUpdate(
      id,
      { status, assigned_maid_id, resolution_note },
      { new: true }
    );

    if (updated && updated.user_id) {
      try {
        const notif = new NotificationModel({
          recipient_id: updated.user_id,
          sender_id: owner_id || null,
          title: `Complaint ${status}`,
          message: status === "Accepted"
            ? `Your complaint "${updated.title}" was accepted by the owner! Please click "Review & Acknowledge" in your Complaints portal so owner can mark it resolved.`
            : `Your complaint "${updated.title}" has been marked as Resolved by the owner.`,
          type: status === "Accepted" ? "complaint_accepted" : "complaint_resolved",
          isRead: false,
        });
        await notif.save();
      } catch (notifErr) {
        console.warn("User notification dispatch failed:", notifErr);
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const markComplaintReviewedByUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await ComplaintModel.findByIdAndUpdate(
      id,
      { user_reviewed: true },
      { new: true }
    );

    if (updated) {
      try {
        const ownerIds = new Set<string>();
        if (updated.pg_id) {
          const pg = await PgModel.findById(updated.pg_id);
          if (pg && pg.reg_id) ownerIds.add(String(pg.reg_id));
        }

        const owners = await RegisterModel.find({ role: { $regex: /owner/i } });
        owners.forEach((o) => ownerIds.add(String(o._id)));

        for (const ownerId of ownerIds) {
          const notif = new NotificationModel({
            recipient_id: ownerId,
            sender_id: updated.user_id,
            title: `Complaint Reviewed by Tenant`,
            message: `Tenant has reviewed and acknowledged your accepted response for "${updated.title}". You can now mark it resolved.`,
            type: "complaint_reviewed",
            isRead: false,
          });
          await notif.save();
        }
      } catch (notifErr) {
        console.warn("Owner review notification dispatch failed:", notifErr);
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ComplaintModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllComplaints: RequestHandler = async (req, res, next) => {
  try {
    await ComplaintModel.deleteMany({});
    res.status(200).json({ message: "All complaints deleted successfully" });
  } catch (error) {
    next(error);
  }
};
