import { RequestHandler } from "express";
import UserModel from "../Models/User.model";
import createHttpError from "http-errors";
import mongoose, { ObjectId } from "mongoose";

// Get all users
export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const registers = await UserModel.aggregate([
      {
        $lookup: {
          from: "registers",
          localField: "reg_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $match: {
          userDetail: { $ne: [] },
        },
      },
    ]);

    res.status(200).json(registers);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById: RequestHandler = async (req, res, next) => {
  const RegisterId = req.params.reg_id;

  try {
    const objectId = new mongoose.Types.ObjectId(RegisterId);
    const user = await UserModel.aggregate([
      {
        $match: { reg_id: objectId },
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
        $match: {
          userDetail: { $ne: [] },
        },
      },
    ]);

    if (user.length === 0) {
      console.log(user); //
      console.log("Register ID not found"); // Debugging
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(user[0]); // Return the first matching user
    }
  } catch (error) {
    next(error);
  }
};

// Create

// Interface for User
interface UserModel {
  reg_id: ObjectId;
  gender: string;
  profile_pic: string;
  idproof_pic: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
  isverified: boolean;
}

// Create a new user
export const createUser: RequestHandler<
  unknown,
  unknown,
  UserModel,
  unknown
> = async (req, res, next) => {
  const reg_id = req.body.reg_id;
  const gender = req.body.gender;
  const address = req.body.address;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const pincode = req.body.pincode;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  try {
    if (!files.profile_pic || !files.idproof_pic) {
      throw createHttpError(400, "Profile pic and ID proof are required");
    } else if (
      !reg_id ||
      !gender ||
      !address ||
      !street ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      throw createHttpError(400, "Please provide all details");
    } else {
      const profile_pic = files.profile_pic[0].path;
      const idproof_pic = files.idproof_pic[0].path;
      const newUser = await UserModel.create({
        reg_id: reg_id,
        gender: gender,
        profile_pic: profile_pic,
        idproof_pic: idproof_pic,
        address: address,
        street: street,
        city: city,
        state: state,
        country: country,
        pincode: pincode,
        isverified: false,
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    next(error);
  }
};

// Update user

// Interface for Update params
interface UpdateUserParams {
  user_id: ObjectId;
}

// Interface for Update body
interface UpdateUserBody {
  reg_id: ObjectId;
  gender: string;
  profile_pic: string;
  idproof_pic: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
  isverified: boolean;
}

// Update user
export const updateUser: RequestHandler<
  UpdateUserParams,
  unknown,
  UpdateUserBody,
  unknown
> = async (req, res, next) => {
  const userId = req.params.user_id;
  const reg_id = req.body.reg_id;
  const gender = req.body.gender;
  const profile_pic = req.body.profile_pic;
  const idproof_pic = req.body.idproof_pic;
  const address = req.body.address;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const pincode = req.body.pincode;
  const isverified = req.body.isverified;

  try {
    if (
      !reg_id ||
      !gender ||
      !profile_pic ||
      !idproof_pic ||
      !address ||
      !street ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !isverified
    ) {
      throw createHttpError(400, "Please provide all details");
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: userId },
        {
          reg_id: reg_id,
          gender: gender,
          profile_pic: profile_pic,
          idproof_pic: idproof_pic,
          address: address,
          street: street,
          city: city,
          state: state,
          country: country,
          pincode: pincode,
          isverified: isverified,
        },
        { new: true }
      );
      if (!updatedUser) {
        throw createHttpError(404, "User ID not found");
      }
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    next(error);
  }
};

export const updateStatus: RequestHandler = async (req, res, next) => {
  const userId = req.params.user_id;

  try {
    // Find user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(createHttpError(404, "User ID not found")); // Return early if user not found
    }

    // Toggle the `isVerified` status
    user.isverified = !user.isverified;

    // Save the updated user
    await user.save();

    // Respond with success message and updated user status
    res.status(200).json({
      message: "User verification status updated successfully",
      user: {
        id: user._id,
        isVerified: user.isverified,
      },
    });
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
};

// Delete user
export const deleteUser: RequestHandler = async (req, res, next) => {
  const userId = req.params.user_id;

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw createHttpError(404, "User ID not found");
    }
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
