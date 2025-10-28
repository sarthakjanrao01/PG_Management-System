import express from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../Controllers/Category.controller";

const router = express.Router();

router.get("/", getCategories);

router.get("/:category_id", getCategoryById);

router.post("/create", createCategory);

router.patch("/update/:category_id", updateCategory);

router.delete("/delete/:category_id", deleteCategory);


export default router;