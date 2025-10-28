import express from "express";
import {
  createPg,
  deletePg,
  getPgById,
  getPgByRegisterId,
  getPgs,
  updatePgStatus,
} from "../Controllers/Pg.controller";
import upload from "../Config/Multer.config";

const router = express.Router();

router.get("/", getPgs);

router.get("/pgdetail/:pg_id", getPgById);

router.get("/:pg_id", getPgByRegisterId);

router.patch("/updatestatus/:pg_id", updatePgStatus);

router.post(
  "/create",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
  ]),
  createPg
);

router.delete("/delete/:pg_id", deletePg);

export default router;
