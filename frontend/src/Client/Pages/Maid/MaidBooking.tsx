import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../Shared/Components/Table";
import { Booking as BookingModel } from "../../../Shared/Models/Booking.model";
import {
  fetchBookings,
  updateBookingProvider,
} from "../../../Shared/Store/BookingAuthStore";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import Loading from "../../../Shared/Components/Loading";
import { fetchProfileByRegisterId } from "../../../Shared/Store/ProfileAuthStore";

const MaidBooking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [registerId, setRegisterId] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete loading
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getState = async (registerId: string) => {
    try {
      setLoading(true);
      const data = await fetchProfileByRegisterId(registerId);
      setState(data.state);
    } catch (err) {
      setError("Failed to fetch state");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (state) {
      getBookings();
    }
  }, [state]);
  
  const getBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings();
      const filteredBookings = data.filter(
        (booking: BookingModel) =>
          booking.status === "Pending" &&
          booking.userProfileDetail?.[0]?.state === state
      );
      setBookings(filteredBookings);
    } catch (err) {
      setError("Failed to fetch bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchRegisterIdAndState = async () => {
      try {
        const token = localStorage.getItem("token");
        if(token)
        {
          const registerId = await getLoggedInUser();
          if (!registerId._id) {
            navigate("/login");
          } else {
            if(registerId.role !== "maid") {
              navigate("/");
              return;
            }
            setRegisterId(registerId._id);
            getState(registerId._id);
          }
        }
        else{
          navigate("/login");
        }
        
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };
    fetchRegisterIdAndState();
  }, [navigate]);
  

  const handleEdit = async (bookingId: string) => {
    try {
      setIsDeleting(true); // Set deleting state to true
      const confirmBooking = await updateBookingProvider(bookingId, registerId);
      if (confirmBooking) {
        getBookings();
      } else {
        setError("Failed to confirm booking");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Error occurred while updating the booking");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isDeleting) {
    return <Loading size={50} />;
  }

  if (error) {
    return <div className="pt-24 pb-10 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Booking ID",
    "UserName",
    "Provider Name",
    "User Address",
    "Gender",
    "Category",
    "Sub Category",
    "Start Date",
    "Status",
  ];

  const data = bookings.map((booking, index) => ({
    No: index + 1,
    _id: booking._id,
    name: booking.name || "N/A",
    provider_id: booking.providerDetail?.[0]?.name || "N/A",
    address: booking.userProfileDetail?.[0]
      ? `${booking.userProfileDetail[0].address}, ${booking.userProfileDetail[0].street}, ${booking.userProfileDetail[0]?.city}, ${booking.userProfileDetail[0]?.state}, ${booking.userProfileDetail[0]?.country}, ${booking.userProfileDetail[0]?.pincode}`
      : "N/A",
    male: booking.gender || "N/A",
    category: booking.category?.[0]?.name || "N/A",
    subcategory_id: booking.subcategory?.[0]?.name || "N/A",
    startDate: booking.start_date
      ? new Date(booking.start_date).toLocaleDateString()
      : "N/A",
    status: booking.status || "N/A",
  }));

  return (
    <div className="bg-white pt-24 px-5 md:px-8 lg:px-14 mb-10">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Booking</h2>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editHeadName="Accept"
        editName="Accept"
        editStatus={true}
        onEdit={handleEdit}
        deleteStatus={false}
      />
    </div>
  );
};

export default MaidBooking;
