import { RequestHandler } from "express";
import Razorpay from "razorpay";
import env from "../util/validateEnv";
import crypto from "crypto";
import PgPaymentModel from "../Models/PgPayment.model";

const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_SECRET,
});

export const pgPayment: RequestHandler = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Payment gateway service is working" });
  } catch (error) {
    next(error);
  }
};

export const createOrder: RequestHandler = async (req, res, next) => {
  const { amount } = req.body;
  console.log("Amount" + amount);
  try {
    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.status(500).json({ error: "Internal server error" });
      }
      console.log(order);
      return res.status(200).json({ data: order });
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment: RequestHandler = async (req, res, next) => {
  const { user_id, pg_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

      console.log("Signature"+ generatedSignature + "Signature" + razorpay_signature);

    const isAuthentic = generatedSignature === razorpay_signature;
    if (isAuthentic) {
      const pgPayment = new PgPaymentModel({
        user_id,
        pg_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      await pgPayment.save();
      res.status(200).json({ message: "Payment successfully" });
    }
    if (!isAuthentic) {
      res.status(400).json({ message: "Invalid payment signature." });
    }
  } catch (error) {
    next(error);
  }
};
