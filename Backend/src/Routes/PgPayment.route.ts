import express from "express";
import { createOrder, pgPayment, verifyPayment } from "../Controllers/PgPayment.controller";

const router = express.Router();

router.get("/getpayment", pgPayment);

router.post("/order", createOrder);

router.post("/verify", verifyPayment);

export default router;