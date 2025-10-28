import React, { useEffect, useState } from "react";
import Table from "../../Shared/Components/Table";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component
import { ContactUs as ContactUsModel } from "../../Shared/Models/ContactUs.model";
import {
  deleteContactUs,
  fetchAllContactUs,
} from "../../Shared/Store/ContactAuthStore";

const AdminContactUs: React.FC = () => {
  const [contactus, setContactUs] = useState<ContactUsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getContactUs = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchAllContactUs();
        setContactUs(data);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    getContactUs();
  }, []);

  const handleDelete = async (contactUsId: string) => {
    if (window.confirm("Are you sure you want to delete this ContactUs?")) {
      try {
        await deleteContactUs(contactUsId); // Call API to delete the contact entry

        // Ensure state updates correctly
        setContactUs((prevContactUs) =>
          prevContactUs.filter((item) => item._id !== contactUsId)
        );
      } catch (error) {
        console.error("Error deleting Contact Us:", error);
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

  const columns = [
    "Sr No.",
    "ContactUs Id",
    "Name",
    "Email",
    "Message",
    "Status",
    "Reg Date",
    "Update Date",
  ];

  // Prepare data in the format that Table expects
  const data = contactus.map((item, index) => ({
    No: index + 1,
    _id: item._id,
    name: item.name,
    email: item.email,
    message: item.message,
    isActive: item.isActive ? "Active" : "Inactive",
    createdAt: new Date(item.createdAt).toLocaleDateString(),
    updatedAt: new Date(item.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className=" bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Contact Us</h2>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editStatus={false}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminContactUs;
