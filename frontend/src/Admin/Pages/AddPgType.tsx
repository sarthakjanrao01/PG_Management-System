import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { createPgType, fetchPgTypeById, updatePgType } from "../../Shared/Store/PgTypeAuthStore";

const AddPgType: React.FC = () => {
  const [pgType, setPgType] = useState("");
  const [status, setStatus] = useState("Active");
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract category_id from query string
  const queryParams = new URLSearchParams(location.search);
  const pgTypeId = queryParams.get("pgtype_id");

  useEffect(() => {
    if (pgTypeId) {
      setIsEditMode(true);
      const fetchPgTypeData = async () => {
        try {
          const data = await fetchPgTypeById(pgTypeId);
          setPgType(data.name);
          setStatus(data.isActive ? "Active" : "Inactive");
        } catch (error) {
          console.error("Error fetching category", error);
        }
      };
      fetchPgTypeData();
    }
  }, [pgTypeId]);

  const handlePgTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPgType(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const statusBool = status === "Active";

    try {
      if (isEditMode) {
        await updatePgType(pgTypeId!, {name: pgType,isActive: statusBool});
      } else {
        await createPgType({
          name: pgType,
          isActive: statusBool,
        });
      }
      navigate("/admin/pgtype");
    } catch (error) {
      console.error("Error saving category", error);
      navigate("/admin/pgtype");
    }
  };

  return (
    <div className="m-5 bg-white rounded shadow pb-4">
      <div className="flex justify-between bg-blue-500 text-white p-4 rounded">
        <h1 className="text-xl font-bold mt-2">{isEditMode ? "Edit PgType" : "Add PgType"}</h1>
        <Link to="/admin/pgtype" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="mt-5 px-5">
        <form onSubmit={handleSubmit}>
          {/* Category Name */}
          <div className="mb-4">
            <label htmlFor="pgType" className="block text-gray-700">
              Pg Type Name:
            </label>
            <input
              type="text"
              name="pgType"
              id="pgType"
              placeholder="Pg Type"
              value={pgType}
              onChange={handlePgTypeChange}
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
              to="/admin/pgtype"
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

export default AddPgType;