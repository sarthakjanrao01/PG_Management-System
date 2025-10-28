import { RequestHandler } from "express";
import PgBookingModel from "../Models/PgBooking.model";
import mongoose from "mongoose";

export const getPgBookings: RequestHandler = async (req, res, next) => {
  try {
    const pgBookings = await PgBookingModel.aggregate([
      {
        $lookup: {
          from: "registers",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$userId"] } } }],
          as: "userProfileDetail",
        },
      },
      {
        $lookup: {
          from: "registers",
          let: { pgownerId: "$pgowner_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pgownerId"] } } }],
          as: "pgOwnerDetail",
        },
      },
      {
        $lookup: {
          from: "pgs",
          let: { pgId: "$pg_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pgId"] } } }],
          as: "pgDetail",
        },
      },
    ]);
    res.status(200).json(pgBookings);
  } catch (error) {
    next(error);
  }
};

export const getPgBookingById: RequestHandler = async (req, res, next) => {
  const pgBookingId = req.params.pgBooking_id;

  try {
    const pgBooking = await PgBookingModel.aggregate([
      {
        $match: {
          pgowner_id: pgBookingId,
        },
      },
      {
        $lookup: {
          from: "registers",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }],
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$userId"] } } }],
          as: "userProfileDetail",
        },
      },
      {
        $lookup: {
          from: "pgs",
          let: { pgId: "$pg_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pgId"] } } }],
          as: "pgDetail",
        },
      },
      {
        $lookup: {
          from: "registers",
          let: { pgOwnerId: "$pgowner_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$pgOwnerId"] } },
            },
          ],
          as: "pgOwnerDetail",
        },
      },
    ]);

    res.status(200).json(pgBooking);
  } catch (error) {
    next(error);
  }
};

export const getPgBookingByPgId: RequestHandler = async (req, res, next) => {
  try {
    const pgId = req.params.pgBooking_id;
    if (!pgId) {
      res.status(400).json({ message: "pgId is required" });
      return; // Ensure function exits after sending response
    }

    const objectId = new mongoose.Types.ObjectId(pgId); // Convert pgId to ObjectId

    console.log("PgId:", objectId);

    const pgBooking = await PgBookingModel.aggregate([
      {
        $match: { pgowner_id: objectId }, // Match using ObjectId
      },
      {
        $lookup: {
          from: "registers",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$userId"] } },
            },
            { $project: { password: 0 } }, // Exclude password for security
          ],
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$userId"] } } }],
          as: "userProfileDetail",
        },
      },
      {
        $lookup: {
          from: "pgs",
          let: { pgId: "$pg_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$pgId"] } },
            },
          ],
          as: "pgDetail",
        },
      },
      {
        $lookup: {
          from: "registers",
          let: { pgOwnerId: "$pgowner_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$pgOwnerId"] } },
            },
          ],
          as: "pgOwnerDetail",
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest bookings
    ]);

    res.status(200).json(pgBooking); // Ensure the response is sent
  } catch (error) {
    console.error("Error fetching PG booking:", error);
    next(error); // Properly pass the error to the next middleware
  }
};

export const getPgBookingByRegisterId: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const RegisterId = req.params.register_id;
    if (!RegisterId) {
      res.status(400).json({ message: "RegisterId is required" });
      return;
    }

    const objectId = new mongoose.Types.ObjectId(RegisterId); // Convert RegisterId to ObjectId

    // console.log("RegisterId:", objectId);

    const pgBooking = await PgBookingModel.aggregate([
      {
        $match: { user_id: objectId }, // Match using ObjectId
      },
      {
        $lookup: {
          from: "registers",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$userId"] } },
            },
            { $project: { password: 0 } }, // Exclude password for security
          ],
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$userId"] } } }],
          as: "userProfileDetail",
        },
      },
      {
        $lookup: {
          from: "pgs",
          let: { pgId: "$pg_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$pgId"] } },
            },
          ],
          as: "pgDetail",
        },
      },
      {
        $lookup: {
          from: "registers",
          let: { pgOwnerId: "$pgowner_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$pgOwnerId"] } },
            },
          ],
          as: "pgOwnerDetail",
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest bookings
    ]);

    res.status(200).json(pgBooking); // Ensure the response is sent
  } catch (error) {
    console.error("Error fetching PG booking:", error);
    next(error); // Properly pass the error to the next middleware
  }
};

interface PgBookingBody {
  user_id: string;
  provider_id: string;
  pg_id: string;
  name: string;
  gender: string;
  start_date: Date;
  status: string;
  payment_status: string;
}

export const checkBookingExist: RequestHandler = async (req, res, next) => {
  const { user_id, provider_id, pg_id } = req.body;
  try {
    const response = await PgBookingModel.findOne({
      user_id,
      pgowner_id: provider_id,
      pg_id,
    });

    if (response) {
      res.status(409).json({ message: "Booking already exists" });
    } else {
      res.status(200).json({ message: "Booking does not exist" });
    }
    return;
  } catch (error) {
    next(error);
  }
};

export const createPgBooking: RequestHandler<
  unknown,
  unknown,
  PgBookingBody
> = async (req, res, next) => {
  try {
    const {
      user_id,
      provider_id,
      pg_id,
      name,
      gender,
      start_date,
      payment_status,
    } = req.body;

    // Validate required fields
    if (
      !user_id ||
      !provider_id ||
      !pg_id ||
      !name ||
      !start_date ||
      !payment_status
    ) {
      res.status(422).json({ message: "All fields are required" });
      return;
    }

    // Convert start_date to Date object
    const parsedStartDate = new Date(start_date);
    if (isNaN(parsedStartDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    // Check if booking already exists
    const existingBooking = await PgBookingModel.findOne({
      user_id,
      pgowner_id: provider_id,
      pg_id,
    });
    console.log("Existing Booking:", existingBooking);
    if (existingBooking) {
      res.status(409).json({ message: "Booking already exists" });
      return;
    }

    // Create new booking
    const newBooking = new PgBookingModel({
      user_id,
      pgowner_id: provider_id,
      pg_id,
      name,
      gender,
      start_date: parsedStartDate,
      status: "Pending",
      payment_status,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};

interface PgBookingParams {
  pgBooking_id: string;
}

interface PgBookingUpdateBody {
  status: string;
}

export const updatePgBooking: RequestHandler<
  PgBookingParams,
  unknown,
  PgBookingUpdateBody,
  unknown
> = async (req, res, next) => {
  const pgBookingId = req.params.pgBooking_id;
  const { status } = req.body;

  try {
    if (!status) {
      throw new Error("Please provide all required fields");
    } else {
      const pgBooking = await PgBookingModel.findOneAndUpdate(
        { _id: pgBookingId },
        { status: status },
        { new: true }
      );
      res.status(200).json(pgBooking);
    }
  } catch (error) {
    next(error);
  }
};

export const deletePgBooking: RequestHandler<PgBookingParams> = async (
  req,
  res,
  next
) => {
  const pgBookingId = req.params.pgBooking_id;

  try {
    const pgBooking = await PgBookingModel.findByIdAndDelete(pgBookingId);
    res.status(200).json(pgBooking);
  } catch (error) {
    next(error);
  }
};
