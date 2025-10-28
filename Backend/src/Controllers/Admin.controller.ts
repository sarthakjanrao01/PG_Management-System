import { RequestHandler } from "express";
import AdminModel from "../Models/Admin.model";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import validateEnv from "../util/validateEnv";

export const getAuthenticatedAdmin: RequestHandler = async (req, res, next) => {
  try {
    const header = req.get("Authorization");

    if (!header) {
      res.status(401).json({ message: "Token is required" });
      return;
    }

    const token = header.split(" ")[1];

    try {
      const userPayload = jwt.verify(
        token,
        validateEnv.JWT_SECRET
      ) as JwtPayload;

      if (!userPayload?.userId) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const adminUser = await AdminModel.findById(userPayload.userId).select(
        "-password"
      );

      if (!adminUser) {
        res.status(404).json({ message: "Admin not found" });
        return;
      }

      res.status(200).json(adminUser);
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export interface LoginBody {
  email: string;
  password: string;
}

export const loginAdmin: RequestHandler<
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
    } else {
      const existingRegister = await AdminModel.findOne({ email: email })
        .select("+password +email")
        .exec();
      if (!existingRegister) {
        throw createHttpError(401, "Invalid Credentials");
      } else {
        const isPasswordValid = await bcrypt.compare(
          password,
          existingRegister.password
        );
        if (!isPasswordValid) {
          throw createHttpError(400, "Invalid Credentials");
        } else {
          const token = await jwt.sign(
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
            message: "Admin find successfully",
            token,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

export const getAdmins: RequestHandler = async (req, res, next) => {
  try {
    const admins = await AdminModel.find().exec();
    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

export const getAdminById: RequestHandler = async (req, res, next) => {
  const adminId = req.params.admin_id;
  try {
    const admin = await AdminModel.findById({
      _id: adminId,
    }).exec();
    if (!admin) {
      throw createHttpError(404, "Admin Id not found");
    } else {
      res.status(200).json(admin);
    }
  } catch (error) {
    next(error);
  }
};

interface AdminBody {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

export const createAdmin: RequestHandler<object, object, AdminBody> = async (
  req,
  res,
  next
) => {
  const { name, email, password, role, isActive } = req.body;

  try {
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      typeof isActive === "undefined"
    ) {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkAdmin = await AdminModel.findOne({ email: email });
      if (checkAdmin) {
        throw createHttpError(400, "Admin already exists");
      } else {
        // Hash the password
        const passwordHashed = await bcrypt.hash(password, 10);

        const newAdmin = await AdminModel.create({
          name: name,
          email: email,
          password: passwordHashed,
          role: role,
          isActive: isActive,
        });
        res.status(201).json(newAdmin);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Interface for Admin Params to update Admin

export interface AdminParamsBody {
  admin_id: string;
}

export interface AdminUpdateBody {
  role?: string;
  isActive: boolean;
}

export const updateAdmin: RequestHandler<
  AdminParamsBody,
  unknown,
  AdminUpdateBody,
  unknown
> = async (req, res, next) => {
  const adminId = req.params.admin_id;

  try {
    // Fetch the current admin details
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      throw createHttpError(404, "Admin ID not found");
    }

    // Reverse the isActive value
    const isActive = !admin.isActive;

    // Update the role and reversed isActive value
    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      adminId,
      { role: req.body.role, isActive: isActive },
      { new: true }
    );

    if (!updatedAdmin) {
      throw createHttpError(404, "Failed to update Admin");
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin: RequestHandler = async (req, res, next) => {
  const adminId = req.params.admin_id;
  try {
    const admin = await AdminModel.findByIdAndDelete(adminId);
    if (!admin) {
      throw createHttpError(404, "Admin Id not found");
    } else {
      res.status(204).json();
    }
  } catch (error) {
    next(error);
  }
};
