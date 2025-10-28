import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  createSubCategory,
  fetchSubCategoryById,
  updateSubCategory,
} from "../../Shared/Store/SubCategoryAuthStore";
import { SubCategory } from "../../Shared/Models/SubCategory.model";
import { fetchCategories } from "../../Shared/Store/CategoryAuthStore";

const AddSubCategory: React.FC = () => {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoriesList, setCategoriesList] = useState<SubCategory[]>([]); // To hold the categories list
  const [subCategory, setSubCategory] = useState(""); // To hold subcategory name
  const navigate = useNavigate();
  const location = useLocation();

  // Extract category_id from query string
  const queryParams = new URLSearchParams(location.search);
  const subCategoryId = queryParams.get("subcategory_id");

  useEffect(() => {
    // Fetching Category for Category DropDown
    const fetchCategoriesList = async () => {
      try {
        const data = await fetchCategories(); // Assume this function gets all categories
        setCategoriesList(data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategoriesList();

    // Fetching SubCategory by ID

    if (subCategoryId) {
      setIsEditMode(true);
    //   console.log("SubCategory ID :" + subCategoryId);

    // Getting SubCategory By Id
      const fetchSubCategoryData = async () => {
        try {
          const data = await fetchSubCategoryById(subCategoryId);
          setCategory(data[0].category_id);
          setSubCategory(data[0].name);
          setStatus(data[0].isActive ? "Active" : "Inactive");
        } catch (error) {
          console.error("Error fetching category", error);
        }
      };
      fetchSubCategoryData();
    }
  }, [subCategoryId]);

  //Handling change Event Start
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubCategory(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  //Handling change Event End

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const statusBool = status === "Active";

    try {
      if (isEditMode) {
        await updateSubCategory(subCategoryId!, {
          category_id: category,
          name: subCategory,
          isActive: statusBool,
        });
      } else {
        await createSubCategory({
          category_id: category, // The selected category ID
          name: subCategory,
          isActive: statusBool,
        });
      }
      navigate("/admin/subcategory");
    } catch (error) {
      console.error("Error saving subCategory", error);
      navigate("/admin/subcategory");
    }
  };

  return (
    <div className="bg-white rounded shadow pb-4">
      <div className="flex justify-between bg-blue-500 text-white p-4 rounded">
        <h1 className="text-xl font-bold mt-2">
          {isEditMode ? "Edit SubCategory" : "Add SubCategory"}
        </h1>
        <Link to="/admin/subcategory" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="mt-5 px-5">
        <form onSubmit={handleSubmit}>
          {/* Category Dropdown */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700">
              Select Category:
            </label>
            <select
              name="category"
              id="category"
              required
              value={category}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded"
            >
              <option disabled value="">Select Category</option>
              {categoriesList.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Name */}
          <div className="mb-4">
            <label htmlFor="subCategory" className="block text-gray-700">
              Subcategory Name:
            </label>
            <input
              type="text"
              name="subCategory"
              id="subCategory"
              placeholder="Enter Subcategory Name"
              required
              value={subCategory}
              onChange={handleSubCategoryChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700">
              Status:
            </label>
            <select
              name="status"
              id="status"
              required
              value={status}
              onChange={handleStatusChange}
              className="w-full p-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              {isEditMode ? "Update" : "Save"}
            </button>
            <NavLink
              to="/admin/subcategory"
              className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
            >
              Cancel
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubCategory;
