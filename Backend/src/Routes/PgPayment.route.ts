import express from "express";
import {
  clearUserPaymentHistory,
  clearAllPayments,
  createOrder,
  deletePayment,
  getAllPayments,
  getPaymentsByUser,
  pgPayment,
  verifyPayment,
} from "../Controllers/PgPayment.controller";

const router = express.Router();

router.get("/getpayment", pgPayment);
router.get("/all", getAllPayments);
router.get("/user/:userId", getPaymentsByUser);

router.delete("/clear-all", clearAllPayments);
router.delete("/user/:userId/clear", clearUserPaymentHistory);
router.delete("/:id", deletePayment);

router.post("/order", createOrder);
router.post("/create-order", createOrder);

router.post("/verify", verifyPayment);

export default router;