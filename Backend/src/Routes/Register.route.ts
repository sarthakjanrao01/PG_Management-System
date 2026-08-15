import express from "express";
import {
  createRegister,
  deleteRegister,
  getAuthenticatedUser,
  getOwners,
  getRegister,
  getRegisterById,
  loginUser,
  logout,
  toggleOwnerApproval,
  updateRegister,
} from "../Controllers/Register.controller";

const router = express.Router();

router.get("/getall", getRegister);
router.get("/owners", getOwners);

router.get("/", getAuthenticatedUser);
router.post("/login", loginUser);
router.post("/logout", logout);

router.put("/approve/:reg_id", toggleOwnerApproval);
router.get("/:reg_id", getRegisterById);
router.post("/signup", createRegister);
router.patch("/update/:reg_id", updateRegister);
router.delete("/delete/:reg_id", deleteRegister);

export default router;