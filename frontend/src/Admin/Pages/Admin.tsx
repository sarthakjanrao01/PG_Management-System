import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Table from "../../Shared/Components/Table";
import {
  deleteAdmin,
  fetchAdmins,
  getLoggedInAdmin,
  updateAdmin,
} from "../Store/AdminAuthStore";
import { Admin as AdminModel } from "../Models/Admin.model";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component

const Admin: React.FC = () => {
  const [admins, setAdmins] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadAdmins = async () => {
    try {
      setLoading(true); // Start loading
      const data = await fetchAdmins(); // Fetch the list of admins
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins.");
    } finally {
      setLoading(false); // Stop loading after fetch
    }
  };

  useEffect(() => {
    setLoading(true);
    async function checkAdminRole() {
      try {
        const loggedInAdmin = await getLoggedInAdmin();
        // console.log("Loggedin admin"+loggedInAdmin);
        if (loggedInAdmin?.role === "SuperAdmin") {
          loadAdmins();
        } else {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        navigate("/adminlogin");
      } finally {
        setLoading(false);
      }
    }
    checkAdminRole();
  }, [navigate]);

  const handleEdit = async (adminId: string) => {
    const admin = admins.find((admin) => admin._id === adminId);
    if (!admin) {
      alert("Admin not found.");
      return;
    }

    const newStatus = admin.isActive ? "Inactive" : "Active";

    if (
      window.confirm(
        `Are you sure you want to change the status of this Admin to ${newStatus}?`
      )
    ) {
      try {
        setLoading(true); // Start loading while updating
        await updateAdmin(adminId);
        loadAdmins(); // Refresh the list after update
      } catch (error) {
        console.error("Error updating admin status:", error);
      } finally {
        setLoading(false); // Stop loading after update
      }
    }
  };

  const handleDelete = async (adminId: string) => {
    if (window.confirm("Are you sure you want to delete this Admin?")) {
      try {
        setLoading(true); // Start loading while deleting
        await deleteAdmin(adminId); // Call API to delete the admin
        setAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin._id !== adminId)
        );
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert("Failed to delete the admin. Please try again.");
      } finally {
        setLoading(false); // Stop loading after deletion
      }
    }
  };

  if (loading) {
    return (
      <div className="m-6 text-center">
        <Loading size={50} /> {/* Show loader while fetching or deleting */}
      </div>
    );
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Admin ID",
    "Name",
    "Role",
    "Status",
    "Reg Date",
    "Update Date",
  ];

  // Prepare data in the format that Table expects
  const data = admins.map((admin, index) => ({
    No: index + 1,
    _id: admin._id,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive ? "Active" : "Inactive",
    createdAt: new Date(admin.createdAt).toLocaleDateString(),
    updatedAt: new Date(admin.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Admins</h2>
        <NavLink
          to="/admin/addadmin"
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
        >
          Add Admin
        </NavLink>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editStatus={true}
        editName="Action"
        onEdit={handleEdit}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Admin;
