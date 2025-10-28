import { axiosInstance } from "../Lib/axios";

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  _id?: string;
  category_id: string; // category_id references the category
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: Category[]; // Category array to hold related category details
}

// Fetch SubCategories
export const fetchSubCategories = async () => {
  try {
    const response = await axiosInstance.get("/subcategory");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sub-categories:", error);
    throw error;
  }
};

export const fetchSubCategoryById = async (
  subCategoryId: string
) => {
  try {
    const response = await axiosInstance.get(`/subcategory/${subCategoryId}`);
    const datas =  await response.data;
    console.log("Response :", datas);
    return datas;
  } catch (error) {
    console.error("Failed to fetch sub-category by id:", error);
    throw error;
  }

};

export const fetchSubCategoryByCategoryId = async (
  categoryId: string
) => {
  try {
    const response = await axiosInstance.get(`/subcategory/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sub-category by category id:", error);
    throw error;
  }
}


// Create SubCategory

export const createSubCategory = async (subCategory: SubCategory) => {
  try {
    await axiosInstance.post("/subcategory/create", subCategory);
  } catch (error) {
    console.error("Failed to create sub-category:", error);
    throw error;
  }
};

// Update SubCategory
export const updateSubCategory = async (
  subCategoryId: string,
  subCategory: SubCategory
) => {
  try {
    await axiosInstance.patch(
      `/subcategory/update/${subCategoryId}`,
      subCategory
    );
  } catch (error) {
    console.error("Failed to update sub-category:", error);
    throw error;
  }
};

// Delete SubCategory
export const deleteSubCategory = async (subCategoryId: string) => {
  try {
    await axiosInstance.delete(`/subcategory/delete/${subCategoryId}`);
  } catch (error) {
    console.error("Failed to delete sub-category:", error);
    throw error;
  }
};
