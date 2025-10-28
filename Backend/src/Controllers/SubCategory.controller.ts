import { RequestHandler } from "express";
import SubCategoryModel from "../Models/SubCategory.model";
import createHttpError from "http-errors";
import mongoose, { ObjectId } from "mongoose";

// Get All Categories
export const getSubCategories: RequestHandler = async (req, res, next) => {
  try {
    const subCategory = await SubCategoryModel.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: "$category",          // Flatten the category array to an object
          },
          {
            $match: {
                category: { $ne: [] },
            },
          },
        ]);
    res.status(200).json(subCategory);
  } catch (error) {
    next(error);
  }
};



// Get SubCategory by ID
export const getSubCategoryById: RequestHandler = async (req, res, next) => {
  const subCategoryId = req.params.subcategory_id;

  try {
    const objectId = new mongoose.Types.ObjectId(subCategoryId);
    const subCategory = await SubCategoryModel.aggregate([
      {
        $match: { _id: objectId },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",          // Flatten the category array to an object
      },
      {
        $match: {
          category: { $ne: [] },
        },
      },
    ]);
    res.status(200).json(subCategory);
  } catch (error) {
    next(error);
  }
};


export const getSubCategoryByCategoryId: RequestHandler = async (req, res, next) => {
  const CategoryId = req.params.category_id;

  try {
    const objectId = new mongoose.Types.ObjectId(CategoryId);
    const subCategory = await SubCategoryModel.aggregate([
      {
        $match: { category_id: objectId },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",          // Flatten the category array to an object
      },
      {
        $match: {
          category: { $ne: [] },
        },
      },
    ]);
    res.status(200).json(subCategory);
  } catch (error) {
    next(error);
  }
};



interface SubCategory
{
  category_id: ObjectId;
  name: string;
  isActive: boolean;
}

export const createSubCategory: RequestHandler<
  unknown,
  unknown,
  SubCategory,
  unknown>
= async (req, res, next) => {
  const { category_id, name, isActive } = req.body;

  try {
    if (!category_id || !name || !isActive) {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkSubCategory  = await SubCategoryModel.findOne({name: name});
      if(checkSubCategory){
        throw createHttpError(409, "Subcategory already exists");
      }
      else{
        const newSubCategory = await SubCategoryModel.create({
          category_id: category_id,
          name: name,
          isActive: isActive,
        });
        res.status(201).json(newSubCategory);
      }
    }
  } catch (error) {
    next(error);
  }
};


// Update SubCategory

interface UpdateSubCategoryParams {
  subcategory_id: ObjectId;
}

interface UpdateSubCategoryBody {
  category_id: ObjectId;
  name: string;
  isActive: boolean;
}

export const updateSubCategory: RequestHandler<
  UpdateSubCategoryParams,
  unknown,
  UpdateSubCategoryBody,
  unknown> = async (req, res) => {
  const subCategoryId = req.params.subcategory_id;
  const { category_id, name, isActive } = req.body;

  try {
    const checkSubCategory = await SubCategoryModel.findOne({name: name});
    if(checkSubCategory){
      throw createHttpError(409, "Subcategory already exists");
    }
    else
    {
      const subCategory = await SubCategoryModel.findByIdAndUpdate(
        { _id: subCategoryId },
        { category_id, name, isActive },
        { new: true }
      );
      res.status(200).json(subCategory);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};


// Delete SubCategory

export const deleteSubCategory: RequestHandler = async (req, res, next) => {
  const subCategoryId = req.params.subcategory_id;

  try {
    const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(subCategoryId);
    if (!deletedSubCategory) {
      throw createHttpError(404, "SubCategory ID not found");
    }
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};