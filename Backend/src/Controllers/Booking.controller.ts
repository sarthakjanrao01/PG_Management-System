import { RequestHandler } from "express";
import BookingModel from "../Models/Booking.model";
import createHttpError from "http-errors";
import mongoose, { ObjectId } from "mongoose";

export const getBookings: RequestHandler = async (req, res, next) => {
  try {
    const bookings = await BookingModel.aggregate([
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$category_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$categoryId"] } } }],
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: "$sub_category_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$subCategoryId"] } } },
          ],
          as: "subcategory",
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
          from: "registers",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$providerId"] } } }],
          as: "providerDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$providerId"] } } }],
          as: "providerProfileDetail",
        },
      },
    ]);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get Booking By Id

export const getBookingById: RequestHandler = async (req, res, next) => {
  const bookingId = req.params.booking_id;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw createHttpError(400, "Invalid Booking ID");
    }
    // Using little Differnt Style to Innerjoin Data
    const booking = await BookingModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(bookingId) },
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$category_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$categoryId"] } } }],
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: "$sub_category_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$subCategoryId"] } } },
          ],
          as: "subcategory",
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
          from: "registers",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$providerId"] } } }],
          as: "providerDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$providerId"] } } }],
          as: "providerProfileDetail",
        },
      },
    ]);

    // Check if booking exists
    if (!booking || booking.length === 0) {
      throw createHttpError(404, "Booking ID not found");
    }

    res.status(200).json(booking[0]); // Return the first (and only) result
  } catch (error) {
    next(error);
  }
};

// Get Booking By Register Id

export const getBookingByRegisterId: RequestHandler = async (
  req,
  res,
  next
) => {
  const registerId = req.params.register_id;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(registerId)) {
      throw createHttpError(400, "Invalid Booking ID");
    }
    // Using little Differnt Style to Innerjoin Data
    const booking = await BookingModel.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(registerId) },
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$category_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$categoryId"] } } }],
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCategoryId: "$sub_category_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$subCategoryId"] } } },
          ],
          as: "subcategory",
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
          from: "registers",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$providerId"] } } }],
          as: "providerDetail",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { providerId: "$provider_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$reg_id", "$$providerId"] } } }],
          as: "providerProfileDetail",
        },
      },
    ]);

    // Check if booking exists
    if (!booking || booking.length === 0) {
      throw createHttpError(404, "Booking ID not found");
    }

    res.status(200).json(booking[0]); // Return the first (and only) result
  } catch (error) {
    next(error);
  }
};

// Interface for Booking Body to create Booking

interface BookingBody {
  user_id: ObjectId;
  provider_id?: ObjectId;
  name?: string;
  gender: string;
  category_id: ObjectId;
  sub_category_id: ObjectId;
  start_date: Date;
  status: string;
}

export const createBooking: RequestHandler<
  unknown,
  unknown,
  BookingBody,
  unknown
> = async (req, res, next) => {
  const {
    user_id,
    provider_id,
    name,
    gender,
    category_id,
    sub_category_id,
    start_date,
  } = req.body;
  try {
    if (
      !user_id ||
      !gender ||
      !category_id ||
      !sub_category_id ||
      !start_date
    ) {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkBooking = await BookingModel.findOne({
        name: name,
        user_id: user_id,
        provider_id: provider_id,
      });
      if (checkBooking) {
        throw createHttpError(400, "Booking already exists");
      } else {
        const newBooking = await BookingModel.create({
          user_id: user_id,
          provider_id: provider_id || null,
          name: name || "",
          gender: gender,
          category_id: category_id,
          sub_category_id: sub_category_id,
          start_date: start_date,
          status: "Pending",
        });
        res.status(201).json(newBooking);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Update Booking

// Interface for Update Booking Params

interface UpdateBookingParams {
  booking_id: ObjectId;
}

interface UpdateBookingProviderBody {
  provider_id: ObjectId;
}

// Update means Assigning Provider to Booking
export const updateBookingProvider: RequestHandler<
  UpdateBookingParams,
  unknown,
  UpdateBookingProviderBody,
  unknown
> = async (req, res, next) => {
  const bookingId = req.params.booking_id;
  const { provider_id } = req.body;
  try {
    if (!provider_id) {
      throw createHttpError(400, "Please provide provider_id");
    } else {
      const updatedBooking = await BookingModel.findOneAndUpdate(
        { _id: bookingId },
        { provider_id: provider_id, status: "Confirmed" },
        { new: true }
      );
      res.status(200).json(updatedBooking);
    }
  } catch (error) {
    next(error);
  }
};

// Update Booking Status to Cancelled
interface UpdateBookingStatusBody {
  status: string;
}

export const updateBookingStatusCanceled: RequestHandler<
  UpdateBookingParams,
  unknown,
  UpdateBookingStatusBody,
  unknown
> = async (req, res, next) => {
  const bookingId = req.params.booking_id;
  try {
    const updatedBooking = await BookingModel.findOneAndUpdate(
      { _id: bookingId },
      { provider_id: null, status: "Cancelled" },
      { new: true }
    );
    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatusPending: RequestHandler<
  UpdateBookingParams,
  unknown,
  UpdateBookingStatusBody,
  unknown
> = async (req, res, next) => {
  const bookingId = req.params.booking_id;
  try {
    const updatedBooking = await BookingModel.findOneAndUpdate(
      { _id: bookingId },
      { provider_id: null, status: "Pending" },
      { new: true }
    );
    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

// Interface for Update Booking Body

interface UpdateBookingBody {
  user_id: ObjectId;
  provider_id?: ObjectId;
  gender: string;
  category_id: ObjectId;
  sub_category_id: ObjectId;
  start_date: Date;
  status: string;
}

export const updateBooking: RequestHandler<
  UpdateBookingParams,
  unknown,
  UpdateBookingBody,
  unknown
> = async (req, res, next) => {
  const bookingId = req.params.booking_id;
  const { user_id, gender, category_id, sub_category_id, start_date, status } =
    req.body;
  try {
    if (
      !user_id ||
      !gender ||
      !category_id ||
      !sub_category_id ||
      !start_date ||
      !status
    ) {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const updatedBooking = await BookingModel.findOneAndUpdate(
        { _id: bookingId },
        {
          user_id: user_id,
          provider_id: null,
          gender: gender,
          category_id: category_id,
          sub_category_id: sub_category_id,
          start_date: start_date,
          status: status,
        },
        { new: true }
      );
      res.status(200).json(updatedBooking);
    }
  } catch (error) {
    next(error);
  }
};

// Delete Booking

export const deleteBooking: RequestHandler = async (req, res, next) => {
  const bookingId = req.params.booking_id;

  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      throw createHttpError(404, "Booking Id not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
