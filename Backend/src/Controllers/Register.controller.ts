import { RequestHandler } from "express";
import RegisterModel from "../Models/Register.model";
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

// Interface for Login Body
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
    } else {
      const existingRegister = await RegisterModel.findOne({ email: email })
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
            message: "User find successfully",
            token,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

// Logout User

export const logout: RequestHandler = (req, res, next) => {
  try {
    // Clear token from cookies if using cookies for authentication
    localStorage.removeItem('token');

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};


// ------------------------------------CRUD For Register------------------------------------------

// Get All Register
export const getRegister: RequestHandler = async (req, res, next) => {
  try {
    const registers = await RegisterModel.find().exec();
    res.status(200).json(registers);
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

// Interface for Register Body to create Register
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
    // Validate required fields
    if (!name || !mobile_number || !email || !password || !role) {
      throw createHttpError(400, "Please provide all details");
    }

    // Check if the email already exists
    const existingEmail = await RegisterModel.findOne({ email }).exec();
    if (existingEmail) {
      throw createHttpError(409, "Email ID already exists");
    }

    // Check if the mobile number already exists
    const existingMobileNumber = await RegisterModel.findOne({
      mobile_number,
    }).exec();
    if (existingMobileNumber) {
      throw createHttpError(409, "Mobile number already exists");
    }

    // Hash the password
    const passwordHashed = await bcrypt.hash(password, 10);

    // Create the new user
    const newRegister = await RegisterModel.create({
      name,
      mobile_number,
      email,
      password: passwordHashed,
      role,
    });

    // req.session.userId = newRegister._id;
    res.status(201).json({
      id: newRegister._id,
      name: newRegister.name,
      mobile_number: newRegister.mobile_number,
      email: newRegister.email,
      role: newRegister.role,
    });
  } catch (error) {
    next(error);
  }
};

// Update Register

// Interface for Update Register Params
interface UpdateRegisterParams {
  reg_id: ObjectId;
}

// Interface for Update Register Body
interface UpdateRegisterBody {
  name: string;
  mobile_number: number;
  email: string;
  password: string;
  role: string;
}

// Update Register
export const updateRegister: RequestHandler<
  UpdateRegisterParams,
  unknown,
  UpdateRegisterBody,
  unknown
> = async (req, res, next) => {
  const regId = req.params.reg_id;
  const { name, mobile_number, email, password, role } = req.body;

  try {
    // Validate required fields
    if (!name || !mobile_number || !email || !password || !role) {
      throw createHttpError(400, "Please provide all details");
    }

    // Check if email or mobile number already exists for another user
    const existingUser = await RegisterModel.findOne({
      $or: [{ email }, { mobile_number }],
      _id: { $ne: regId }, // Exclude the current user from the check
    }).exec();

    if (existingUser) {
      throw createHttpError(
        400,
        `The email or mobile number is already associated with another account.`
      );
    }

    // Perform the update
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

// Delete Register
export const deleteRegister: RequestHandler = async (req, res, next) => {
  const regId = req.params.reg_id;
  try {
    const deletedRegister = await RegisterModel.findByIdAndDelete(regId).exec();
    if (!deletedRegister) {
      throw createHttpError(404, "Register Id not found");
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
};
