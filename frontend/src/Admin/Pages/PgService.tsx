import React, { useEffect, useState } from "react";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component
import { Pg as PgModel } from "../../Shared/Models/Pg.model";
import {
  changePgStatus,
  deletePg,
  fetchPgs,
} from "../../Shared/Store/PgAuthStore";
import PgTable from "../../Shared/Components/PgTable";

const PgService: React.FC = () => {
  const [pgs, setPgs] = useState<PgModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getPgs = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchPgs();
        setPgs(data);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    getPgs();
  }, []);

  const handleEdit = async (pgId: string) => {
    if (
      window.confirm(`Are you sure you want to change the status of this Pg?`)
    ) {
      setLoading(true);
      await changePgStatus(pgId);
      setPgs((prevPgs) =>
        prevPgs.map((pg) =>
          pg._id === pgId ? { ...pg, isVerified: !pg.isVerified } : pg
        )
      );
      setLoading(false);
    }
  };

  const handleDelete = async (pgId: string) => {
    if (window.confirm("Are you sure you want to delete this Pg?")) {
      setLoading(true); // Start loading before deletion
      try {
        await deletePg(pgId); // Call API to delete the Pg

        // Update the categories state
        setPgs((prevPgs) => prevPgs.filter((pg) => pg._id !== pgId));
      } catch (error) {
        console.error("Error deleting Pg:", error);
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

  const columns = [
    "No",
    "Pg Id",
    "Name",
    "Price",
    "Type",
    "Address",
    "Image1",
    "Image2",
    "Image3",
    "Image4",
    "Image5",
    "Status",
    "Is Verified",
    "Created At",
    "Updated At",
  ];

  // Prepare data in the format that Table expects
  const data = pgs.map((pg, index) => ({
    No: index + 1,
    pgId: pg._id,
    name: pg.userDetail?.[0]?.name || "N/A", // Fallback if name is missing
    price: pg.price, // Fallback if price is missing
    type: pg.pgtype[0]?.name || "N/A", // Use the first item in pgtype array
    address: `${pg.address}, ${pg.street}, ${pg.city}, ${pg.state}, ${pg.country}, ${pg.pincode}`, // Fallback for address
    image1: pg.image1 || "", // Fallback for images
    image2: pg.image2 || "",
    image3: pg.image3 || "",
    image4: pg.image4 || "",
    image5: pg.image5 || "",
    status: pg.status || "Pending", // Fallback for status
    isActive: pg.isVerified ? "Active" : "Inactive", // Active or Inactive
    createdAt: new Date(pg.createdAt).toLocaleDateString() || "N/A", // Formatted created date
    updatedAt: new Date(pg.updatedAt).toLocaleDateString() || "N/A", // Formatted updated date
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Pg</h2>
      </div>

      {/* Table Section */}
      <PgTable
        columns={columns}
        data={data}
        editStatus={true}
        editHeadName="Action"
        editName="Action"
        onEdit={handleEdit}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PgService;
