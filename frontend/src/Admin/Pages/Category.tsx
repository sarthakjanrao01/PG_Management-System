import React, { useEffect, useState } from "react";
import { fetchCategories, deleteCategory } from "../../Shared/Store/CategoryAuthStore";
import { Category as CategoryModel } from "../../Shared/Models/Category.model";
import { NavLink, useNavigate } from "react-router-dom";
import Table from "../../Shared/Components/Table";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component

const Category: React.FC = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    getCategories();
  }, []);

  const handleEdit = (categoryId: string) => {
    navigate(`/admin/addcategory?category_id=${categoryId}`);
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true); // Start loading before deletion
      try {
        await deleteCategory(categoryId); // Call API to delete the category

        // Update the categories state
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category._id !== categoryId)
        );
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setLoading(false); // End loading after deletion
      }
    }
  };

  if (loading) {
    return (
      <div className="m-6 text-center">
        {/* Pass size and color to the loader */}
        <Loading size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  const columns = ["Sr No.", "Category ID", "Category", "Status", "Reg Date", "Update Date"];

  // Prepare data in the format that Table expects
  const data = categories.map((category, index) => ({
    No: index + 1,
    _id: category._id,
    name: category.name,
    isActive: category.isActive ? "Active" : "Inactive",
    createdAt: new Date(category.createdAt).toLocaleDateString(),
    updatedAt: new Date(category.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Category</h2>
        <NavLink
          to="/admin/addcategory"
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
        >
          Add Category
        </NavLink>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editStatus={true}
        editName="Edit"
        onEdit={handleEdit}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Category;