import express from "express";
import {
  clearUserPaymentHistory,
  createOrder,
  getPaymentsByUser,
  pgPayment,
  verifyPayment,
} from "../Controllers/PgPayment.controller";

const router = express.Router();

router.get("/getpayment", pgPayment);
router.get("/user/:userId", getPaymentsByUser);
router.delete("/user/:userId/clear", clearUserPaymentHistory);

router.post("/order", createOrder);
router.post("/create-order", createOrder);

router.post("/verify", verifyPayment);

export default router;