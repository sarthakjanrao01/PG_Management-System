import React, { useEffect, useState } from "react";
import Table from "../../../Shared/Components/Table";
import {
  deleteBookings,
} from "../../../Shared/Store/BookingAuthStore";
import Loading from "../../../Shared/Components/Loading"; // Assuming you have a reusable loading spinner component
import { fetchPgBookings } from "../../../Shared/Store/PgBookingAuthStore";
import { PgBookingBody as PgBookingModel } from "../../../Shared/Models/PgBooking.model";

const PgConfirmedBooking: React.FC = () => {
  const [pgBookings, setPgBookings] = useState<PgBookingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // State to track deleting operation
  const [error, setError] = useState("");

  useEffect(() => {
    const getBookings = async () => {
      try {
        const data = await fetchPgBookings();
        const filteredPgBookings = data.filter(
          (pgbooking: PgBookingModel) => pgbooking.status === "Confirmed"
        );
        console.log(filteredPgBookings);
        setPgBookings(filteredPgBookings);
      } catch (err) {
        setError("Failed to fetch Pg Bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, []);

  const handleDelete = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this Pg Booking?")) {
      setDeleting(true); // Start loading when deleting
      try {
        await deleteBookings(bookingId); // Call API to delete the booking
        setPgBookings((prevPgBookings) =>
          prevPgBookings.filter((pgBooking) => pgBooking._id !== bookingId)
        );
        alert("Pg Booking deleted successfully!"); // Notify user of success
      } catch (error) {
        console.error("Error deleting Booking:", error);
        alert("Failed to delete the booking. Please try again.");
      } finally {
        setDeleting(false); // Stop loading after delete operation
      }
    }
  };

  if (loading || deleting) {
    return (
      <div className="m-6 text-center">
        <Loading size={50} />
      </div>
    ); // Show loading spinner
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Booking ID",
    "UserName",
    "Provider Name",
    "Mobile Number",
    "Gender",
    "Start Date",
    "Status",
    "Reg Date",
    "Update Date",
  ];

  // Prepare data in the format that Table expects
  const data = pgBookings.map((PgBookingModel, index) => ({
    No: index + 1,
    _id: PgBookingModel._id,
    user_id: PgBookingModel.name || "N/A",
    provider_id: PgBookingModel.pgOwnerDetail?.[0]?.name || "N/A",
    mobile_number: PgBookingModel.pgOwnerDetail?.[0]?.mobile_number || "N/A",
    gender: PgBookingModel.gender || "N/A",
    startDate: PgBookingModel.start_date
      ? new Date(PgBookingModel.start_date).toLocaleDateString()
      : "N/A",
    status: PgBookingModel.status || "N/A",
    createdAt: PgBookingModel.createdAt
      ? new Date(PgBookingModel.createdAt).toLocaleDateString()
      : "N/A",
    updatedAt: PgBookingModel.updatedAt
      ? new Date(PgBookingModel.updatedAt).toLocaleDateString()
      : "N/A",
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Confirmed Pg Booking</h2>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editStatus={false}
        editName="Edit"
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PgConfirmedBooking;
