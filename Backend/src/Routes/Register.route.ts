import express from "express";
import { createRegister, deleteRegister, getAuthenticatedUser, getRegister, getRegisterById, loginUser, logout, updateRegister } from "../Controllers/Register.controller";

const router = express.Router();

router.get("/getall" , getRegister);

router.get("/", getAuthenticatedUser);

router.post("/login", loginUser);

router.post("/logout", logout)

router.get("/:reg_id", getRegisterById);

router.post("/signup" , createRegister);

router.patch("/update/:reg_id", updateRegister);

router.delete("/delete/:reg_id", deleteRegister);

export default router;