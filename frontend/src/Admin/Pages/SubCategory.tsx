import React, { useEffect, useState } from "react";
import { SubCategory as SubCategoryModel } from "../../Shared/Models/SubCategory.model";
import { NavLink, useNavigate } from "react-router-dom";
import Table from "../../Shared/Components/Table";
import { deleteSubCategory, fetchSubCategories } from "../../Shared/Store/SubCategoryAuthStore";
import Loading from "../../Shared/Components/Loading";

const SubCategory: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false); // To track delete loading state
  const navigate = useNavigate();

  const getSubCategories = async () => {
    try {
      const data = await fetchSubCategories();
      console.log("SubCategories:", data);
      if (Array.isArray(data)) {
        setSubCategories(data);
      } else if (data && typeof data === "object") {
        setSubCategories([data]); // Wrap in an array
      } else {
        setSubCategories([]); // Default to an empty array
      }
    } catch (err) {
      setError("Failed to fetch categories. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubCategories();
  }, []);

  useEffect(() => {
    console.log("Updated SubCategories:", subCategories);
  }, [subCategories]);

  const handleEdit = (subCategoryId: string) => {
    navigate(`/admin/addsubcategory?subcategory_id=${subCategoryId}`);
  };

  const handleDelete = async (subCategoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setDeleting(true); // Start deleting state
      try {
        await deleteSubCategory(subCategoryId);
        // Remove deleted category from state
        setSubCategories((prevCategories) =>
          prevCategories.filter((subCategory) => subCategory._id !== subCategoryId)
        );
        alert("SubCategory deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      } finally {
        setDeleting(false); // Stop deleting state
      }
    }
  };

  if (loading || deleting) {
    return <div className="m-6 text-center"><Loading size={50} /></div>;
  }

  if (error) {
    return (
      <div className="m-6 text-center text-red-500">
        {error}
        <button
          onClick={getSubCategories}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const columns = [
    "Sr No.",
    "Sub Category ID",
    "Category",
    "Name",
    "Status",
    "Reg Date",
    "Update Date",
  ];


  const data = subCategories.map((subCategory, index) => ({
    No: index + 1,
    _id: subCategory._id,
    category: subCategory.category.name,
    name: subCategory.name,
    isActive: subCategory.isActive ? "Active" : "Inactive",
    createdAt: new Date(subCategory.createdAt).toLocaleDateString(),
    updatedAt: new Date(subCategory.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">SubCategory</h2>
        <NavLink
          to="/admin/addsubcategory"
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
        >
          Add SubCategory
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

export default SubCategory;