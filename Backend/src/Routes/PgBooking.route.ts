import express from "express";
import { checkBookingExist, createPgBooking, getPgBookingById, getPgBookingByPgId, getPgBookingByRegisterId, getPgBookings, updatePgBooking } from "../Controllers/PgBooking.controller";

const router = express.Router();

router.get("/", getPgBookings);

router.get("/:pgBooking_id", getPgBookingById);

router.get("/bypgid/:pgBooking_id", getPgBookingByPgId);

router.get("/byregisterid/:register_id", getPgBookingByRegisterId);

router.post("/check", checkBookingExist);

router.post("/create", createPgBooking);

router.patch("/update/:pgBooking_id", updatePgBooking);

router.delete("/delete/:pgBooking_id", updatePgBooking);

export default router;