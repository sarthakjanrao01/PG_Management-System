import express from "express";
import { createSubCategory, deleteSubCategory, getSubCategories, getSubCategoryByCategoryId, getSubCategoryById, updateSubCategory } from "../Controllers/SubCategory.controller";

const router = express.Router();

router.get("/", getSubCategories);

router.get("/:subcategory_id", getSubCategoryById);

router.get("/category/:category_id", getSubCategoryByCategoryId);

router.post("/create", createSubCategory);

router.patch("/update/:subcategory_id", updateSubCategory);

router.delete("/delete/:subcategory_id", deleteSubCategory);




export default router;