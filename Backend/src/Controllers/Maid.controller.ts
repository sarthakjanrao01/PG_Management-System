import { RequestHandler } from "express";
import MaidModel from "../Models/Maid.model";
import MaidAttendanceModel from "../Models/MaidAttendance.model";
import MaidTaskModel from "../Models/MaidTask.model";
import SalaryPaymentModel from "../Models/SalaryPayment.model";
import RegisterModel from "../Models/Register.model";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Owner adds Maid account
export const addMaid: RequestHandler = async (req, res, next) => {
  try {
    const { name, mobile_number, email, password, owner_id, pg_id, duty_type, salary } = req.body;

    if (!name || !mobile_number || !email || !password || !owner_id || !pg_id || !duty_type || !salary) {
      res.status(422).json({ message: "All maid fields are required" });
      return;
    }

    const existingUser = await RegisterModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const registerRecord = new RegisterModel({
      name,
      mobile_number,
      email,
      password: hashedPassword,
      role: "maid",
    });

    const savedRegister = await registerRecord.save();

    const newMaid = new MaidModel({
      user_id: savedRegister._id,
      owner_id,
      pg_id,
      name,
      mobile_number,
      duty_type,
      salary: Number(salary),
      status: "Active",
    });

    const savedMaid = await newMaid.save();
    res.status(201).json(savedMaid);
  } catch (error) {
    next(error);
  }
};

// Get maids for an owner or PG
export const getMaidsByOwner: RequestHandler = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const objectId = new mongoose.Types.ObjectId(ownerId);
    const maids = await MaidModel.aggregate([
      { $match: { owner_id: objectId } },
      {
        $lookup: {
          from: "pgs",
          localField: "pg_id",
          foreignField: "_id",
          as: "pgDetail",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(maids);
  } catch (error) {
    next(error);
  }
};

// Get maid details by logged-in maid user_id
export const getMaidByUserId: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);
    const maid = await MaidModel.aggregate([
      { $match: { user_id: objectId } },
      {
        $lookup: {
          from: "pgs",
          localField: "pg_id",
          foreignField: "_id",
          as: "pgDetail",
        },
      },
    ]);
    res.status(200).json(maid[0] || null);
  } catch (error) {
    next(error);
  }
};

// Attendance
export const markAttendance: RequestHandler = async (req, res, next) => {
  try {
    const { maid_id, date, status, note } = req.body;
    const recordDate = date ? new Date(date) : new Date();
    const attendance = new MaidAttendanceModel({
      maid_id,
      date: recordDate,
      status,
      note,
    });
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByMaid: RequestHandler = async (req, res, next) => {
  try {
    const { maidId } = req.params;
    const records = await MaidAttendanceModel.find({ maid_id: maidId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// Tasks
export const assignTask: RequestHandler = async (req, res, next) => {
  try {
    const { maid_id, pg_id, task_title, description, due_date } = req.body;
    const newTask = new MaidTaskModel({
      maid_id,
      pg_id,
      task_title,
      description,
      due_date: due_date ? new Date(due_date) : undefined,
      status: "Pending",
    });
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getTasksByMaid: RequestHandler = async (req, res, next) => {
  try {
    const { maidId } = req.params;
    const tasks = await MaidTaskModel.find({ maid_id: maidId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, completion_note } = req.body;
    const updateData: Record<string, unknown> = { status };
    if (status === "Completed") {
      updateData.completed_at = new Date();
      updateData.completion_note = completion_note || "";
    }
    const updated = await MaidTaskModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Salary Payments
export const recordSalaryPayment: RequestHandler = async (req, res, next) => {
  try {
    const { maid_id, month, amount, payment_method } = req.body;
    const payment = new SalaryPaymentModel({
      maid_id,
      month,
      amount,
      payment_method: payment_method || "Cash",
      status: "Paid",
    });
    const saved = await payment.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getSalaryHistoryByMaid: RequestHandler = async (req, res, next) => {
  try {
    const { maidId } = req.params;
    const payments = await SalaryPaymentModel.find({ maid_id: maidId }).sort({ paid_date: -1 });
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};
