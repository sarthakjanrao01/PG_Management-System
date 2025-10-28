import express from "express";
import { createAdmin, deleteAdmin, getAdminById, getAdmins, getAuthenticatedAdmin, loginAdmin, updateAdmin } from "../Controllers/Admin.controller";

const router = express.Router();

router.get("/", getAuthenticatedAdmin);

router.post("/login", loginAdmin);

router.get("/getall" , getAdmins );

router.get("/:admin_id", getAdminById);

router.post("/create", createAdmin);

router.patch<{ admin_id: string }>("/update/:admin_id", updateAdmin);

router.delete("/delete/:admin_id", deleteAdmin);

export default router;