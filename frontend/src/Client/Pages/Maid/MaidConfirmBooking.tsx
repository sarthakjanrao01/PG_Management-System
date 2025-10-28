import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../Shared/Components/Table";
import Loading from "../../../Shared/Components/Loading"; // Import the Loading component
import { Booking as BookingModel } from "../../../Shared/Models/Booking.model";
import {
  fetchBookings,
  updateBookingStatusPending,
} from "../../../Shared/Store/BookingAuthStore";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";

const MaidConfirmBooking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [userRegisterId, setUserRegisterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getBookings = async (registerId: string | null) => {
    if (!registerId) {
      setError("Register ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchBookings();
      const filteredBookings = data.filter(
        (booking: BookingModel) =>
          booking.provider_id === registerId && booking.status === "Confirmed"
      );
      setBookings(filteredBookings);
    } catch (err) {
      setError("Failed to fetch Bookings");
      console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRegisterIdAndBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await getLoggedInUser();

          if (response.role !== "maid") {
            console.error("User Not Authenticated:");
            navigate("/");
            return;
          }
          if (!response || !response._id) {
            console.error("User Not Authenticated:");
            navigate("/login");
            return;
          }

          console.log("User ID:", response._id);
          setUserRegisterId(response._id);
          getBookings(response._id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
        navigate("/");
      }
    };

    fetchRegisterIdAndBookings();
  }, []);

  const handleEdit = async (bookingId: string) => {
    try {
      setLoading(true); // Set loading state to true when canceling the booking
      const confirmBooking = await updateBookingStatusPending(bookingId);
      if (confirmBooking) {
        // After canceling, filter out the canceled booking
        getBookings(userRegisterId);
      } else {
        navigate("/booking");
      }
    } catch {
      setError("Error occurred while canceling the booking");
    } finally {
      setLoading(false); // Set loading state to false when done
    }
  };

  if (loading) {
    return <Loading size={50} />; // Show Loading component if data is being fetched or deleted
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  // Show message if no bookings are available
  if (!loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">No bookings available.</p>
      </div>
    );
  }

  const columns = [
    "Sr No.",
    "Booking ID",
    "UserName",
    "User Address",
    "Provider Name",
    "Male",
    "Category",
    "Sub Category",
    "Start Date",
    "Status",
  ];

  // Prepare data in the format that Table expects
  const data = bookings.map((booking, index) => ({
    No: index + 1,
    _id: booking._id,
    user_id: booking.name || "N/A",
    address: booking.userProfileDetail?.[0]
      ? `${booking.userProfileDetail[0].address}, ${booking.userProfileDetail[0].street}, ${booking.userProfileDetail[0]?.city}, ${booking.userProfileDetail[0]?.state}, ${booking.userProfileDetail[0]?.country}, ${booking.userProfileDetail[0]?.pincode}`
      : "N/A",
    provider_id: booking.providerDetail?.[0]?.name || "N/A",
    male: booking.gender || "N/A",
    category_id: booking.category?.[0]?.name || "N/A",
    subcategory_id: booking.subcategory?.[0]?.name || "N/A",
    startDate: booking.start_date
      ? new Date(booking.start_date).toLocaleDateString()
      : "N/A",
    status: booking.status || "N/A",
  }));

  return (
    <div className="bg-white pt-24 px-5 md:px-8 lg:px-14 mb-10">
      {/* Content Container */}
      <div className="w-full">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-blue-500">Maid Booking</h2>
        </div>

        {/* Table Section */}
        <Table
          columns={columns}
          data={data}
          editHeadName="Cancel Booking"
          editName="Cancel Booking"
          editStatus={true}
          onEdit={handleEdit}
          deleteStatus={false}
        />
      </div>
    </div>
  );
};

export default MaidConfirmBooking;
