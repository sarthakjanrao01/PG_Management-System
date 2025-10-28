import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  createAdmin,
  getLoggedInAdmin,
} from "../Store/AdminAuthStore";
import Loading from "../../Shared/Components/Loading";

const AddAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Active",
  });

  useEffect(() => {
    async function checkAdminRole() {
      setLoading(true);
      try {
        const loggedInAdmin = await getLoggedInAdmin();
        if (loggedInAdmin?.role !== "SuperAdmin") {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        navigate("/adminlogin"); // Redirect in case of error
      }
      finally {
        setLoading(false);
      }
    }
    checkAdminRole();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isActive = formData.status === "Active";

    try {
      await createAdmin({ ...formData, isActive });
      navigate("/admin/admindetail");
    } catch (error) {
      console.error("Error saving admin", error);
    }
  };

  if(loading)
  {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size={50} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow pb-4">
      <div className="flex justify-between bg-blue-500 text-white p-4 rounded">
        <h1 className="text-xl font-bold mt-2">
          Add Admin
        </h1>
        <Link to="/admin/admindetail" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="mt-5 px-5">
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Admin Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter admin name"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter email"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter password"
            />
          </div>

          {/* Role Dropdown */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700">
              Role:
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700">
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              Save
            </button>
            <NavLink
              to="/admin/admindetail"
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

export default AddAdmin;
