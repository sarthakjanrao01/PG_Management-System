import { RequestHandler } from "express";
import CategoryModel from "../Models/Category.model";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";

// Get All Categories
export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find().exec();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// Get Category By Id
export const getCategoryById: RequestHandler = async (req, res, next) => {
  const categoryId = req.params.category_id;
  try {
    const category = await CategoryModel.findById(categoryId).exec();
    if (!category) {
      throw createHttpError(404, "Category Id not found");
    } else {
      res.status(200).json(category);
    }
  } catch (error) {
    next(error);
  }
};

// Interface for Category Body to create Category
interface CategoryBody {
  name: string;
  isActive: boolean;
}

export const createCategory: RequestHandler<
  unknown,
  unknown,
  CategoryBody,
  unknown
> = async (req, res, next) => {
  const { name, isActive } = req.body;

  try {
    if (!name || typeof isActive === "undefined") {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkCageory = await CategoryModel.findOne({ name: name });
      if (checkCageory) {
        throw createHttpError(400, "Category already exists");
      } else {
        const newCategory = await CategoryModel.create({
          name: name,
          isActive: isActive,
        });
        res.status(201).json(newCategory);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Update Category

// Interface for Update Cateogry Params
interface UpdateCategoryParams {
  category_id: ObjectId;
}

// Interface for Update Category Body

interface UpdateCategoryBody {
  name: string;
  isActive: boolean;
}

export const updateCategory: RequestHandler<
  UpdateCategoryParams,
  unknown,
  UpdateCategoryBody,
  unknown
> = async (req, res, next) => {
  const categoryId = req.params.category_id;
  const name = req.body.name;
  const isActive = req.body.isActive;

  try {
    if (!name || typeof isActive === "undefined") {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkCageory = await CategoryModel.findOne({ name: name });
      if (checkCageory) {
        alert("Category already exists");
        throw createHttpError(400, "Category already exists");
      } else {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
          { _id: categoryId },
          { name: name, isActive: isActive },
          { new: true }
        );
        res.status(200).json(updatedCategory);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Delete Category

export const deleteCategory: RequestHandler = async (
  req,
  res,
  next
) => {
  const categoryId = req.params.category_id;
  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      throw createHttpError(404, "Category ID not found");
    }
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
