import express from "express";
import { createBooking, deleteBooking, getBookingById, getBookingByRegisterId, getBookings, updateBooking, updateBookingProvider, updateBookingStatusCanceled, updateBookingStatusPending } from "../Controllers/Booking.controller";

const router = express.Router();

router.get("/", getBookings);

router.get("/:booking_id", getBookingById);

router.get("/byregisterid/:register_id", getBookingByRegisterId);

router.post("/create", createBooking);

router.patch("/updateprovider/:booking_id", updateBookingProvider);

router.patch("/update/:booking_id", updateBooking);

router.patch("/update/pendingstatus/:booking_id", updateBookingStatusPending);

router.patch("/update/cancelstatus/:booking_id", updateBookingStatusCanceled);

router.delete("/delete/:booking_id", deleteBooking);

export default router;