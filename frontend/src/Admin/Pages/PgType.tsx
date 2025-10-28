import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Table from "../../Shared/Components/Table";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component
import { PgType as PgTypeModel } from "../../Shared/Models/PgType.model";
import { deletePgType, fetchPgTypes } from "../../Shared/Store/PgTypeAuthStore";

const PgType: React.FC = () => {
  const [pgTypes, setPgTypes] = useState<PgTypeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getPgTypes = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchPgTypes();
        setPgTypes(data);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    getPgTypes();
  }, []);

  const handleEdit = (pgTypeId: string) => {
    navigate(`/admin/addpgtype?pgtype_id=${pgTypeId}`);
  };

  const handleDelete = async (pgTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true); // Start loading before deletion
      try {
        await deletePgType(pgTypeId); // Call API to delete the category

        // Update the categories state
        setPgTypes((prevPgTypes) =>
          prevPgTypes.filter((pgType) => pgType._id !== pgTypeId)
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
    return <div className="text-center text-red-500">{error}</div>;
  }

  const columns = ["Sr No.", "Pg Type ID", "Name", "Status", "Reg Date", "Update Date"];

  // Prepare data in the format that Table expects
  const data = pgTypes.map((pgtype, index) => ({
    No: index + 1,
    _id: pgtype._id,
    name: pgtype.name,
    isActive: pgtype.isActive ? "Active" : "Inactive",
    createdAt: new Date(pgtype.createdAt).toLocaleDateString(),
    updatedAt: new Date(pgtype.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Pg Type</h2>
        <NavLink
          to="/admin/addpgtype"
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
        >
          Add Pg Type
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

export default PgType;