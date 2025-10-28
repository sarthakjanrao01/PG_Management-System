import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { createCategory, fetchCategoryById, updateCategory } from "../../Shared/Store/CategoryAuthStore";

const AddCategory: React.FC = () => {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract category_id from query string
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category_id");

  useEffect(() => {
    if (categoryId) {
      setIsEditMode(true);
      const fetchCategoryData = async () => {
        try {
          const data = await fetchCategoryById(categoryId);
          setCategory(data.name);
          setStatus(data.isActive ? "Active" : "Inactive");
        } catch (error) {
          console.error("Error fetching category", error);
        }
      };
      fetchCategoryData();
    }
  }, [categoryId]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const statusBool = status === "Active";

    try {
      if (isEditMode) {
        await updateCategory(categoryId!, {name: category,isActive: statusBool});
      } else {
        await createCategory({
          name: category,
          isActive: statusBool,
        });
      }
      navigate("/admin/category");
    } catch (error) {
      console.error("Error saving category", error);
      navigate("/admin/category");
    }
  };

  return (
    <div className="bg-white rounded shadow pb-4">
      <div className="flex justify-between bg-blue-500 text-white p-4 rounded">
        <h1 className="text-xl font-bold mt-2">{isEditMode ? "Edit Category" : "Add Category"}</h1>
        <Link to="/admin/category" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="mt-5 px-5">
        <form onSubmit={handleSubmit}>
          {/* Category Name */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700">
              Category Name:
            </label>
            <input
              type="text"
              name="category"
              id="category"
              placeholder="Category"
              value={category}
              onChange={handleCategoryChange}
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
              to="/admin/category"
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

export default AddCategory;