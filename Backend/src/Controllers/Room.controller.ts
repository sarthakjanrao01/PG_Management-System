import { RequestHandler } from "express";
import RoomModel from "../Models/Room.model";
import TenancyModel from "../Models/Tenancy.model";
import PgModel from "../Models/Pg.model";
import mongoose from "mongoose";

export const getRoomsByPgId: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    let query: Record<string, unknown> = {};
    if (pgId !== "all" && mongoose.Types.ObjectId.isValid(pgId)) {
      query = { pg_id: pgId };
    }
    const rooms = await RoomModel.find(query).sort({ room_no: 1 });

    // Self-healing check: ensure room occupied_count & status match actual active tenancies in database
    const syncedRooms = await Promise.all(
      rooms.map(async (room) => {
        const activeCount = await TenancyModel.countDocuments({
          room_id: room._id,
          status: "Active",
        });

        let expectedStatus: "Vacant" | "Partially Occupied" | "Fully Occupied" = "Vacant";
        if (activeCount >= room.capacity) {
          expectedStatus = "Fully Occupied";
        } else if (activeCount > 0) {
          expectedStatus = "Partially Occupied";
        }

        if (room.occupied_count !== activeCount || room.status !== expectedStatus) {
          room.occupied_count = activeCount;
          room.status = expectedStatus;
          await room.save();
        }

        return room;
      })
    );

    res.status(200).json(syncedRooms);
  } catch (error) {
    next(error);
  }
};

export const getAllAvailableRooms: RequestHandler = async (req, res, next) => {
  try {
    const rooms = await RoomModel.aggregate([
      {
        $match: {
          $expr: { $lt: ["$occupied_count", "$capacity"] },
        },
      },
      {
        $lookup: {
          from: "pgs",
          localField: "pg_id",
          foreignField: "_id",
          as: "pgDetail",
        },
      },
      { $sort: { rent: 1 } },
    ]);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

export const createRoom: RequestHandler = async (req, res, next) => {
  try {
    const { pg_id, room_no, type, capacity, rent, floor, amenities, owner_id } = req.body;
    if (!room_no || !rent) {
      res.status(422).json({ message: "Room number and rent price are required." });
      return;
    }

    const roomType = type || "Single";
    let roomCapacity = Number(capacity);
    if (!roomCapacity || isNaN(roomCapacity)) {
      const typeStr = String(roomType).toLowerCase();
      if (typeStr.includes("single")) roomCapacity = 1;
      else if (typeStr.includes("double")) roomCapacity = 2;
      else if (typeStr.includes("triple")) roomCapacity = 3;
      else if (typeStr.includes("four")) roomCapacity = 4;
      else if (typeStr.includes("five")) roomCapacity = 5;
      else if (typeStr.includes("six")) roomCapacity = 6;
      else roomCapacity = 1;
    }

    let targetPgId = pg_id;
    if (!targetPgId || !mongoose.Types.ObjectId.isValid(targetPgId)) {
      let existingPg = null;
      if (owner_id && mongoose.Types.ObjectId.isValid(owner_id)) {
        existingPg = await PgModel.findOne({ reg_id: owner_id });
      }
      if (!existingPg) {
        existingPg = await PgModel.findOne();
      }
      if (!existingPg) {
        const defaultPg = new PgModel({
          reg_id: owner_id && mongoose.Types.ObjectId.isValid(owner_id) ? owner_id : new mongoose.Types.ObjectId(),
          name: "Main PG Property",
          price: Number(rent),
          sub_category_id: new mongoose.Types.ObjectId(),
          type_id: new mongoose.Types.ObjectId(),
          address: "Main PG Building, City Center",
          street: "Station Road",
          city: "Gujarat",
          state: "Gujarat",
          country: "India",
          pincode: "383001",
          status: "Active",
          isVerified: true,
        });
        existingPg = await defaultPg.save();
      }
      targetPgId = existingPg._id;
    }

    const newRoom = new RoomModel({
      pg_id: targetPgId,
      room_no: String(room_no).trim(),
      type: roomType,
      capacity: roomCapacity,
      occupied_count: 0,
      rent: Number(rent),
      floor: Number(floor || 1),
      amenities: Array.isArray(amenities) ? amenities : ["AC", "WiFi", "Attached Bath"],
      status: "Vacant",
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error in createRoom:", error);
    next(error);
  }
};

export const updateRoom: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await RoomModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await RoomModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllRooms: RequestHandler = async (req, res, next) => {
  try {
    await RoomModel.deleteMany({});
    res.status(200).json({ message: "All rooms deleted successfully from database" });
  } catch (error) {
    next(error);
  }
};
