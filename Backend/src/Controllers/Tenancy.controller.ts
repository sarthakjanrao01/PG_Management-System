import { RequestHandler } from "express";
import TenancyModel from "../Models/Tenancy.model";
import RoomModel from "../Models/Room.model";
import PgBookingModel from "../Models/PgBooking.model";
import mongoose from "mongoose";

export const allotRoom: RequestHandler = async (req, res, next) => {
  try {
    const { user_id, room_id, booking_id, allotment_date } = req.body;
    let { pg_id } = req.body;

    if (!user_id || !room_id) {
      res.status(422).json({ message: "User ID and Room ID are required" });
      return;
    }

    const room = await RoomModel.findById(room_id);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    if (!pg_id || !mongoose.Types.ObjectId.isValid(pg_id)) {
      pg_id = room.pg_id;
    }

    // Check if user already has active tenancy in this room
    const existingTenancy = await TenancyModel.findOne({ user_id, room_id, status: "Active" });
    if (existingTenancy) {
      res.status(200).json(existingTenancy);
      return;
    }

    if (room.occupied_count >= room.capacity) {
      res.status(400).json({ message: "Room is already fully occupied" });
      return;
    }

    const newTenancy = new TenancyModel({
      user_id,
      pg_id,
      room_id,
      booking_id,
      allotment_date: allotment_date ? new Date(allotment_date) : new Date(),
      status: "Active",
    });

    const savedTenancy = await newTenancy.save();

    // Update Room occupancy count & status
    const newCount = room.occupied_count + 1;
    const newStatus = newCount >= room.capacity ? "Fully Occupied" : "Partially Occupied";
    await RoomModel.findByIdAndUpdate(room_id, {
      occupied_count: newCount,
      status: newStatus,
    });

    // If booking_id provided, mark booking as Confirmed
    if (booking_id) {
      await PgBookingModel.findByIdAndUpdate(booking_id, { status: "Confirmed" });
    }

    res.status(201).json(savedTenancy);
  } catch (error) {
    next(error);
  }
};

export const getTenantsByPgId: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    let matchQuery: Record<string, unknown> = {};
    if (pgId !== "all" && mongoose.Types.ObjectId.isValid(pgId)) {
      matchQuery = { pg_id: new mongoose.Types.ObjectId(pgId) };
    }
    const tenancies = await TenancyModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "registers",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      { $match: { userDetail: { $ne: [] } } },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "roomDetail",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(tenancies);
  } catch (error) {
    next(error);
  }
};

export const getTenantsByRoomId: RequestHandler = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const objectId = new mongoose.Types.ObjectId(roomId);
    const tenancies = await TenancyModel.aggregate([
      { $match: { room_id: objectId, status: "Active" } },
      {
        $lookup: {
          from: "registers",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      { $match: { userDetail: { $ne: [] } } },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(tenancies);
  } catch (error) {
    next(error);
  }
};

export const getTenancyByUserId: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);
    const tenancies = await TenancyModel.aggregate([
      { $match: { user_id: objectId, status: { $ne: "Vacated" } } },
      {
        $lookup: {
          from: "pgs",
          localField: "pg_id",
          foreignField: "_id",
          as: "pgDetail",
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
    ]);
    res.status(200).json(tenancies);
  } catch (error) {
    next(error);
  }
};

export const vacateTenant: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenancy = await TenancyModel.findById(id);
    if (!tenancy) {
      res.status(404).json({ message: "Tenancy record not found" });
      return;
    }

    tenancy.status = "Vacated";
    tenancy.vacate_date = new Date();
    await tenancy.save();

    // Update Room occupancy
    const room = await RoomModel.findById(tenancy.room_id);
    if (room) {
      const newCount = Math.max(0, room.occupied_count - 1);
      const newStatus = newCount === 0 ? "Vacant" : "Partially Occupied";
      await RoomModel.findByIdAndUpdate(tenancy.room_id, {
        occupied_count: newCount,
        status: newStatus,
      });
    }

    res.status(200).json({ message: "Tenant marked as vacated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getQuickListByPgId: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    let matchQuery: Record<string, unknown> = {};
    if (pgId !== "all" && mongoose.Types.ObjectId.isValid(pgId)) {
      matchQuery = { pg_id: new mongoose.Types.ObjectId(pgId) };
    }
    const tenancies = await TenancyModel.aggregate([
      { $match: { ...matchQuery, status: "Active" } },
      {
        $lookup: {
          from: "registers",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      { $match: { userDetail: { $ne: [] } } },
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
          from: "pgpayments",
          localField: "user_id",
          foreignField: "user_id",
          as: "paymentDetail",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const formatted = tenancies.map((t) => {
      const u = t.userDetail?.[0] || {};
      const r = t.roomDetail?.[0] || {};
      const payments = t.paymentDetail || [];

      const totalPaid = payments.reduce((acc: number, p: { amount?: number }) => acc + (p.amount || 0), 0);
      const allotmentDate = t.allotment_date ? new Date(t.allotment_date) : new Date();
      const paidMonthsCount = Math.max(1, payments.length);

      const validStartDate = new Date(allotmentDate);
      validStartDate.setMonth(validStartDate.getMonth() + (paidMonthsCount - 1));

      const validEndDate = new Date(allotmentDate);
      validEndDate.setMonth(validEndDate.getMonth() + paidMonthsCount);

      return {
        _id: t._id,
        status: t.status || "Active",
        allotment_date: t.allotment_date,
        user: {
          _id: u._id,
          name: u.name || "Occupant",
          email: u.email || "",
          mobile_number: u.mobile_number || u.phone || "N/A",
        },
        room: {
          _id: r._id,
          room_no: r.room_no || "N/A",
          type: r.type || "Standard",
          floor: r.floor || 1,
          rent: r.rent || 0,
          capacity: r.capacity || 1,
          occupied_count: r.occupied_count || 1,
          amenities: r.amenities || [],
        },
        payment: {
          total_paid: totalPaid,
          rent: r.rent || 0,
          status: totalPaid >= (r.rent || 0) && (r.rent || 0) > 0 ? "Paid" : totalPaid > 0 ? "Partial" : "Pending",
          payment_count: payments.length,
        },
        validity: {
          start_date: validStartDate.toISOString(),
          end_date: validEndDate.toISOString(),
        },
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

