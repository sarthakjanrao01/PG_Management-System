import { RequestHandler } from "express";
import RegisterModel from "../Models/Register.model";
import NotificationModel from "../Models/Notification.model";
import TenancyModel from "../Models/Tenancy.model";
import PgPaymentModel from "../Models/PgPayment.model";
import ComplaintModel from "../Models/Complaint.model";
import PgBookingModel from "../Models/PgBooking.model";
import BookingModel from "../Models/Booking.model";
import PgModel from "../Models/Pg.model";
import MaidModel from "../Models/Maid.model";
import RoomModel from "../Models/Room.model";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { ObjectId } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import validateEnv from "../util/validateEnv";

// -----------------------------CheckAuth, Login, Logout-------------------------------------------------

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const header = req.get("Authorization");

    if (!header) {
      res.status(401).json({ message: "Token is required" });
      return;
    }

    const token = header.split(" ")[1];

    try {
      const userPayload = jwt.verify(token, validateEnv.JWT_SECRET) as JwtPayload;

      if (!userPayload?.userId) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await RegisterModel.findById(userPayload.userId).select("-password");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Login User
interface LoginBody {
  email: string;
  password: string;
}

export const loginUser: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (!email || !password) {
      throw createHttpError(400, "Please provide all details");
    }

    const existingRegister = await RegisterModel.findOne({ email: email })
      .select("+password +email +role +isApproved")
      .exec();

    if (!existingRegister) {
      res.status(404).json({ message: "No account found with this email address. Please check your email or sign up." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingRegister.password
    );

    if (!isPasswordValid) {
      res.status(400).json({ message: "Incorrect password. Please verify your password and try again." });
      return;
    }

    // Enforce Superadmin Approval for Owner role
    const userRole = (existingRegister.role || "").toLowerCase();
    if ((userRole === "owner" || userRole === "pgowner") && !existingRegister.isApproved) {
      res.status(403).json({ message: "Your owner account is pending approval from Super Admin." });
      return;
    }

    const token = jwt.sign(
      {
        userId: existingRegister._id,
      },
      validateEnv.JWT_SECRET
    );

    if (!token) {
      res.status(401).json({ message: "Token creation failed" });
      return;
    }

    res.status(200).json({
      message: "User login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout User
export const logout: RequestHandler = (req, res, next) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Get All Register
export const getRegister: RequestHandler = async (req, res, next) => {
  try {
    const registers = await RegisterModel.find().exec();
    res.status(200).json(registers);
  } catch (error) {
    next(error);
  }
};

// Get All Owners for Superadmin
export const getOwners: RequestHandler = async (req, res, next) => {
  try {
    const owners = await RegisterModel.find({
      role: { $in: ["owner", "pgowner", "Owner", "PGOwner"] },
    }).sort({ createdAt: -1 });
    res.status(200).json(owners);
  } catch (error) {
    next(error);
  }
};

// Toggle Owner Approval by Superadmin
export const toggleOwnerApproval: RequestHandler = async (req, res, next) => {
  try {
    const { reg_id } = req.params;
    const { isApproved } = req.body;

    const owner = await RegisterModel.findById(reg_id);
    if (!owner) {
      res.status(404).json({ message: "Owner account not found" });
      return;
    }

    owner.isApproved = typeof isApproved === "boolean" ? isApproved : !owner.isApproved;
    const updated = await owner.save();

    // Send notification to owner
    if (updated.isApproved) {
      try {
        const notif = new NotificationModel({
          recipient_id: updated._id,
          title: "Account Approved by Superadmin",
          message: "Congratulations! Your PG Owner account has been approved by Superadmin. You can now log in.",
          type: "account_approved",
          isRead: false,
        });
        await notif.save();
      } catch (notifErr) {
        console.warn("Notification send failed:", notifErr);
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Get Register By Id
export const getRegisterById: RequestHandler = async (req, res, next) => {
  const regId = req.params.reg_id;
  try {
    const register = await RegisterModel.findById(regId).exec();
    if (!register) {
      throw createHttpError(404, "Register Id not found");
    } else {
      res.status(200).json(register);
    }
  } catch (error) {
    next(error);
  }
};

// Interface for Register Body
interface RegisterBody {
  name: string;
  mobile_number: number;
  email: string;
  password: string;
  role: string;
}

export const createRegister: RequestHandler<
  unknown,
  unknown,
  RegisterBody,
  unknown
> = async (req, res, next) => {
  const { name, mobile_number, email, password, role } = req.body;

  try {
    if (!name || !mobile_number || !email || !password || !role) {
      throw createHttpError(400, "Please provide all details");
    }

    const existingEmail = await RegisterModel.findOne({ email }).exec();
    if (existingEmail) {
      res.status(409).json({ message: "This email address is already registered. Please sign in instead." });
      return;
    }

    const existingMobileNumber = await RegisterModel.findOne({
      mobile_number,
    }).exec();
    if (existingMobileNumber) {
      res.status(409).json({ message: "This mobile number is already registered. Please use a different number or sign in." });
      return;
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    const isOwner = ["owner", "pgowner"].includes(role.toLowerCase());

    const newRegister = await RegisterModel.create({
      name,
      mobile_number,
      email,
      password: passwordHashed,
      role,
      isApproved: !isOwner, // Owners require superadmin approval
    });

    res.status(201).json({
      id: newRegister._id,
      name: newRegister.name,
      mobile_number: newRegister.mobile_number,
      email: newRegister.email,
      role: newRegister.role,
      isApproved: newRegister.isApproved,
    });
  } catch (error) {
    next(error);
  }
};

// Update Register
interface UpdateRegisterParams {
  reg_id: ObjectId;
}

interface UpdateRegisterBody {
  name: string;
  mobile_number: number;
  email: string;
  password: string;
  role: string;
}

export const updateRegister: RequestHandler<
  UpdateRegisterParams,
  unknown,
  UpdateRegisterBody,
  unknown
> = async (req, res, next) => {
  const regId = req.params.reg_id;
  const { name, mobile_number, email, password, role } = req.body;

  try {
    if (!name || !mobile_number || !email || !password || !role) {
      throw createHttpError(400, "Please provide all details");
    }

    const existingUser = await RegisterModel.findOne({
      $or: [{ email }, { mobile_number }],
      _id: { $ne: regId },
    }).exec();

    if (existingUser) {
      throw createHttpError(
        400,
        "The email or mobile number is already associated with another account."
      );
    }

    const updatedRegister = await RegisterModel.findByIdAndUpdate(
      { _id: regId },
      { name, mobile_number, email, password, role },
      { new: true }
    ).exec();

    if (!updatedRegister) {
      throw createHttpError(404, "Register ID not found");
    }

    res.status(200).json(updatedRegister);
  } catch (error) {
    next(error);
  }
};

// Delete Register (Cascade delete all user/owner data across collections & sync room occupancy)
export const deleteRegister: RequestHandler = async (req, res, next) => {
  const regId = req.params.reg_id;
  try {
    const deletedRegister = await RegisterModel.findByIdAndDelete(regId).exec();
    if (!deletedRegister) {
      throw createHttpError(404, "Register Id not found");
    }

    // Find any PGs owned by this account (if owner role)
    const ownerPgs = await PgModel.find({ reg_id: regId });
    const pgIds = ownerPgs.map((p) => p._id);

    // Find active tenancies of this user BEFORE deleting them to update room occupancy
    const userTenancies = await TenancyModel.find({ user_id: regId });
    const affectedRoomIds = userTenancies.map((t) => t.room_id).filter(Boolean);

    // Cascade delete all associated data across all database collections
    await Promise.all([
      RoomModel.deleteMany({ pg_id: { $in: pgIds } }),
      TenancyModel.deleteMany({ $or: [{ user_id: regId }, { pg_id: { $in: pgIds } }] }),
      PgPaymentModel.deleteMany({ $or: [{ user_id: regId }, { pg_id: { $in: pgIds } }] }),
      ComplaintModel.deleteMany({ $or: [{ user_id: regId }, { pg_id: { $in: pgIds } }] }),
      NotificationModel.deleteMany({ $or: [{ recipient_id: regId }, { sender_id: regId }] }),
      PgBookingModel.deleteMany({ $or: [{ user_id: regId }, { pg_id: { $in: pgIds } }] }),
      BookingModel.deleteMany({ user_id: regId }),
      PgModel.deleteMany({ reg_id: regId }),
      MaidModel.deleteMany({ reg_id: regId }),
    ]);

    // Recalculate room occupancy & status for all affected rooms
    for (const roomId of affectedRoomIds) {
      const room = await RoomModel.findById(roomId);
      if (room) {
        const activeCount = await TenancyModel.countDocuments({ room_id: roomId, status: "Active" });
        room.occupied_count = activeCount;
        if (activeCount === 0) {
          room.status = "Vacant";
        } else if (activeCount >= room.capacity) {
          room.status = "Fully Occupied";
        } else {
          room.status = "Partially Occupied";
        }
        await room.save();
      }
    }

    res.status(200).json({ message: "User account and all associated records deleted cleanly from database." });
  } catch (error) {
    next(error);
  }
};
