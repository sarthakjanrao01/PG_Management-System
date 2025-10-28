import express from "express";
import { createPgType, deletePgType, getPgTypeById, getPgTypes, updatePgType } from "../Controllers/PgType.controller";

const router = express.Router();

router.get("/", getPgTypes);

router.get("/:pgtype_id", getPgTypeById);

router.post("/create", createPgType);

router.patch("/update/:pgtype_id", updatePgType);

router.delete("/delete/:pgtype_id", deletePgType);

export default router;