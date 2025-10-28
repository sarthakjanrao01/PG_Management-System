import express from "express";
import { changeStatus, createService, deleteService, getServiceById, getServices, updateService } from "../Controllers/Service.controller";

const router = express.Router();

router.get("/", getServices);

router.get("/:service_id", getServiceById);

router.post("/create", createService);

router.patch("/changestatus/:service_id", changeStatus);

router.patch("/update/:service_id", updateService);

router.delete("/delete/:service_id", deleteService);


export default router;