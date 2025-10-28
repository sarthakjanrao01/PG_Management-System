import React, { useEffect, useState } from "react";
import Table from "../../../Shared/Components/Table";
import { Booking as BookingModel } from "../../../Shared/Models/Booking.model";
import {
  deleteBookings,
  fetchBookings,
} from "../../../Shared/Store/BookingAuthStore";
import Loading from "../../../Shared/Components/Loading"; // Importing Loading component

const ConfirmedBooking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false); // State to track the delete loading

  useEffect(() => {
    const getBookings = async () => {
      setLoading(true); // Set loading to true before starting the fetch
      try {
        const data = await fetchBookings();
        const filteredBookings = data.filter(
          (booking: BookingModel) => booking.status === "Confirmed"
        );
        setBookings(filteredBookings);
      } catch (err) {
        setError("Failed to fetch Bookings");
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    getBookings();
  }, []);

  const handleDelete = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this Booking?")) {
      setDeleting(true); // Start loading during delete
      try {
        await deleteBookings(bookingId); // Call API to delete the booking

        // Update the bookings state by removing the deleted booking
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== bookingId)
        );
      } catch (error) {
        console.error("Error deleting Booking:", error);
        alert("Failed to delete the booking. Please try again.");
      } finally {
        setDeleting(false); // End delete loading state
      }
    }
  };

  if (loading || deleting) {
    return <div className="m-6 text-center"><Loading size={50} color="#3b82f6" /></div>;
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Booking ID",
    "UserName",
    "Provider Name",
    "Male",
    "Category",
    "Sub Category",
    "Start Date",
    "Status",
    "Reg Date",
    "Update Date",
  ];

  // Prepare data in the format that Table expects
  const data = bookings.map((booking, index) => ({
    No: index + 1,
    _id: booking._id,
    user_id: booking.userDetail?.[0]?.name || "N/A",
    provider_id: booking.providerDetail?.[0]?.name || "N/A",
    male: booking.gender || "N/A",
    category_id: booking.category?.[0]?.name || "N/A",
    subcategory_id: booking.subcategory?.[0]?.name || "N/A",
    startDate: booking.start_date
      ? new Date(booking.start_date).toLocaleDateString()
      : "N/A",
    status: booking.status || "N/A",
    createdAt: booking.createdAt
      ? new Date(booking.createdAt).toLocaleDateString()
      : "N/A",
    updatedAt: booking.updatedAt
      ? new Date(booking.updatedAt).toLocaleDateString()
      : "N/A",
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Confirmed Booking</h2>
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

export default ConfirmedBooking;