import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../Shared/Components/Loading";
import { Booking as BookingModel } from "../../../Shared/Models/Booking.model";
import { fetchBookingsByRegisterId } from "../../../Shared/Store/BookingAuthStore";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import MaidBookingCard from "../../Components/Maid/MaidBookingCard"; // Import the new component

const UserMaidBooking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getBookings = async (registerId: string | null) => {
    setLoading(true);
    if (!registerId) {
      setError("Register ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const maidBooking = await fetchBookingsByRegisterId(registerId);
      console.log(maidBooking); // Debugging purpose
      if (Array.isArray(maidBooking)) {
        setBookings(maidBooking);
      } else if (maidBooking && typeof maidBooking === "object") {
        setBookings([maidBooking]);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchRegisterIdAndBookings = async () => {
        try {
          setLoading(true);
          const registerId = await getLoggedInUser();
          if (!registerId._id) {
            navigate("/login");
          } else {
            getBookings(registerId._id);
          }
        } catch (error) {
          console.error(error);
          navigate("/");
        } finally {
          setLoading(false);
        }
      };
      fetchRegisterIdAndBookings();
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (loading) {
    return <Loading size={50} />;
  }

  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white pt-24 px-5 md:px-8 lg:px-14 mb-10">
      <div className="w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-blue-500">Maid Booking</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center pt-24">
            <p className="text-lg text-gray-500">No bookings found.</p>
            <button
              onClick={() => navigate("/maidbooking")}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Do Booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <MaidBookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMaidBooking;