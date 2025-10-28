import { axiosInstance } from "../Lib/axios";

// Get All Categories
export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get("/category");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};


// Get Category By Id
export const fetchCategoryById = async (categoryId: string) => {
  try {
    const response = await axiosInstance.get(`/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};
// Interface for Category
interface Category {
  name: string;
  isActive: boolean;
}

// Create Category
export const createCategory = async (category: Category) => {
  try {
    await axiosInstance.post("/category/create", category);
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};



// Update Category
export const updateCategory = async (
  categoryId: string,
  data: { name: string; isActive: boolean }
) => {
  try {
    const response = await axiosInstance.patch(
      `/category/update/${categoryId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete Category
export const deleteCategory = async (categoryId: string) => {
  try {
    await axiosInstance.delete(`/category/delete/${categoryId}`);
  } catch (error) {
    console.log("Failed to delete category:", error);
    throw error;
  }
};
