import { RequestHandler } from "express";
import MessPlanModel from "../Models/MessPlan.model";
import MessEnrollmentModel from "../Models/MessEnrollment.model";
import mongoose from "mongoose";

// Mess Plans
export const getMessPlansByPgId: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    const plans = await MessPlanModel.find({ pg_id: pgId, status: "Active" });
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};

export const createMessPlan: RequestHandler = async (req, res, next) => {
  try {
    const { pg_id, title, price, meals_included, timings, description } = req.body;
    if (!pg_id || !title || !price) {
      res.status(422).json({ message: "PG, Title, and Price are required" });
      return;
    }
    const newPlan = new MessPlanModel({
      pg_id,
      title,
      price,
      meals_included: meals_included || [],
      timings,
      description,
    });
    const saved = await newPlan.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const deleteMessPlan: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await MessPlanModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Mess plan deleted" });
  } catch (error) {
    next(error);
  }
};

// Mess Enrollments
export const enrollMess: RequestHandler = async (req, res, next) => {
  try {
    const { user_id, pg_id, mess_plan_id, start_date, duration_months } = req.body;
    if (!user_id || !pg_id || !mess_plan_id) {
      res.status(422).json({ message: "User, PG, and Plan IDs are required" });
      return;
    }

    const startDate = start_date ? new Date(start_date) : new Date();
    const months = duration_months ? parseInt(duration_months) : 1;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const enrollment = new MessEnrollmentModel({
      user_id,
      pg_id,
      mess_plan_id,
      start_date: startDate,
      end_date: endDate,
      payment_status: "Paid",
      status: "Active",
    });

    const saved = await enrollment.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getUserMessEnrollment: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);
    const enrollments = await MessEnrollmentModel.aggregate([
      { $match: { user_id: objectId, status: "Active" } },
      {
        $lookup: {
          from: "messplans",
          localField: "mess_plan_id",
          foreignField: "_id",
          as: "planDetail",
        },
      },
    ]);
    res.status(200).json(enrollments[0] || null);
  } catch (error) {
    next(error);
  }
};

export const getPgMessEnrollments: RequestHandler = async (req, res, next) => {
  try {
    const { pgId } = req.params;
    const objectId = new mongoose.Types.ObjectId(pgId);
    const enrollments = await MessEnrollmentModel.aggregate([
      { $match: { pg_id: objectId } },
      {
        $lookup: {
          from: "registers",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $lookup: {
          from: "messplans",
          localField: "mess_plan_id",
          foreignField: "_id",
          as: "planDetail",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(enrollments);
  } catch (error) {
    next(error);
  }
};
