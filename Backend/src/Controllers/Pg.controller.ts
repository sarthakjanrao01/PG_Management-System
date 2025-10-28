import { RequestHandler } from "express";
import createHttpError from "http-errors";
import PgModel from "../Models/Pg.model";
import mongoose, { isValidObjectId } from "mongoose";

export const getPgs: RequestHandler = async (req, res, next) => {
  try {
    const pgs = await PgModel.aggregate([
      {
        $lookup: {
          from: "registers",
          localField: "reg_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "pgtypes",
          localField: "type_id",
          foreignField: "_id",
          as: "pgtype",
        },
      },

      {
        $match: {
          userDetail: { $ne: [] },
          subCategory: { $ne: [] },
          pgtype: { $ne: [] },
        },
      },
    ]);
    res.status(200).json(pgs);
  } catch (error) {
    next(error);
  }
};

export const getPgById: RequestHandler = async (req, res, next) => {
  try {
    const pgId = req.params.pg_id;
    const pg = await PgModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(pgId) },
      },
      {
        $lookup: {
          from: "registers",
          localField: "reg_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "pgtypes",
          localField: "type_id",
          foreignField: "_id",
          as: "pgtype",
        },
      },
      {
        $match: {
          "userDetail.0": { $exists: true }, // Ensures there's at least one userDetail
          "subCategory.0": { $exists: true }, // Ensures there's at least one subCategory
          "pgtype.0": { $exists: true }, // Ensures there's at least one pgtype
        },
      },
    ]);

    if (pg.length === 0) {
      throw createHttpError(404, "PG not found");
    }

    // Accessing the first element since it's an array
    res.status(200).json(pg[0]);
  } catch (error) {
    next(error);
  }
};

export const getPgByRegisterId: RequestHandler = async (req, res, next) => {
  try {
    const pgId = req.params.pg_id;
    const pg = await PgModel.aggregate([
      {
        $match: { reg_id: new mongoose.Types.ObjectId(pgId) },
      },
      {
        $lookup: {
          from: "registers", // Replace "registers" with the correct collection name
          localField: "reg_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "pgtypes", // Replace "pgtypes" with the correct collection name
          localField: "type_id",
          foreignField: "_id",
          as: "pgtype",
        },
      },
      {
        $match: {
          "userDetail.0": { $exists: true }, // Ensures there's at least one userDetail
          "subCategory.0": { $exists: true },
          "pgtype.0": { $exists: true }, // Ensures there's at least one pgtype
        },
      },
    ]);

    if (pg.length === 0) {
      throw createHttpError(404, "PG not found");
    }

    // Accessing the first element since it's an array
    res.status(200).json(pg);
  } catch (error) {
    next(error);
  }
};

// Interface for Pg Body to Create Category
interface PgBody {
  reg_id: string;
  name: string;
  price: number;
  sub_category_id: string;
  type_id: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
  status: boolean;
  isVerified: boolean;
}

export const createPg: RequestHandler<unknown, unknown, PgBody, unknown> = async (req, res, next) => {
  const {
    reg_id,
    name,
    price,
    sub_category_id,
    type_id,
    address,
    street,
    city,
    state,
    country,
    pincode
  } = req.body; // Form data from the body

  // Get the uploaded images
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const image1 = files?.image1 ? files.image1[0].path : null;
  const image2 = files?.image2 ? files.image2[0].path : null;
  const image3 = files?.image3 ? files.image3[0].path : null;
  const image4 = files?.image4 ? files.image4[0].path : null;
  const image5 = files?.image5 ? files.image5[0].path : null;

  try {
    if (
      !reg_id ||
      !name ||
      !price ||
      !sub_category_id ||
      !type_id ||
      !address ||
      !street ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      throw createHttpError(400, "Please Provide all required fields");
    } else {
      const newPg = await PgModel.create({
        reg_id,
        name,
        price,
        sub_category_id,
        type_id,
        address,
        street,
        city,
        state,
        country,
        pincode,
        image1,
        image2,
        image3,
        image4,
        image5,
        status: "Pending",
        isVerified: false,
      });
      res.status(200).json(newPg);
    }
  } catch (error) {
    next(error);
  }
};


export const updatePgStatus: RequestHandler = async (req, res, next) => {
  try {
    const pgId = req.params.pg_id;
    if (!isValidObjectId(pgId)) {
      throw createHttpError(400, "Invalid Pg ID");
    }
    const pg = await PgModel.findById(pgId);
    if (!pg) {
      throw createHttpError(404, "Service ID not found");
    }

    const isVerified = !pg.isVerified;
    const updatedPg = await PgModel.findByIdAndUpdate(
      pgId,
      { isVerified },
      { new: true }
    );
    if (!updatedPg) {
      throw createHttpError(404, "Failed to update Service Status");
    }
    res.status(200).json(updatedPg);
  } catch (error) {
    next(error);
  }
};

export const deletePg: RequestHandler = async (req, res, next) => {
  try {
    const pgId = req.params.pg_id;
    if (!isValidObjectId(pgId)) {
      throw createHttpError(400, "Invalid Pg ID");
    }
    const pg = await PgModel.findByIdAndDelete(pgId);
    if (!pg) {
      throw createHttpError(404, "PG ID not found");
    }
    res.status(200).json({ message: "PG deleted successfully" });
  } catch (error) {
    next(error);
  }
};
