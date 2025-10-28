import express from "express";
import { createContactUs, deleteContactUs, getAllContactUs } from "../Controllers/ContactUs.controller";

const router = express.Router();

router.get("/", getAllContactUs);

router.post("/create", createContactUs);

router.delete("/delete/:contactus_id", deleteContactUs);

export default router;