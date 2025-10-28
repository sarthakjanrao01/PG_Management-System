import express from "express";
import { createUser, deleteUser, getUserById, getUsers, updateStatus, updateUser } from "../Controllers/User.controller";
import upload from '../Config/Multer.config';
import UserModel from '../Models/User.model'; // Assuming this is your user schema
import createHttpError from 'http-errors';

const router = express.Router();

router.get("/" , getUsers);

router.get("/:reg_id", getUserById);

router.get("/updatestatus/:user_id", updateStatus);

router.post("/create", upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'idproof_pic', maxCount: 1 },
]), createUser);

router.patch("/update/:user_id", updateUser);

router.delete("/delete/:user_id", deleteUser);


// Update profile with file upload
router.post('/update-profile', upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'idproof_pic', maxCount: 1 },
]), async (req, res, next) => {
  const {
    reg_id,
    gender,
    address,
    street,
    city,
    state,
    country,
    pincode,
  } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  try {
    if (!files.profile_pic || !files.idproof_pic) {
      throw createHttpError(400, 'Profile pic and ID proof are required');
    }

    const profilePicUrl = files.profile_pic[0].path;
    const idProofUrl = files.idproof_pic[0].path;

    const updatedUser = await UserModel.findOneAndUpdate(
      { reg_id : reg_id },
      {
        reg_id,
        gender,
        profile_pic: profilePicUrl,
        idproof_pic: idProofUrl,
        address,
        street,
        city,
        state,
        country,
        pincode,
        isVerified: false,
      },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});


export default router;