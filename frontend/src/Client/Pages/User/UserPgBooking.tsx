import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../Shared/Components/Loading";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgBookingsByRegisterId } from "../../../Shared/Store/PgBookingAuthStore";
import { PgBookingBody as PgBookingBodyModel } from "../../../Shared/Models/PgBooking.model";
import PgBookingCard from "../../Components/Pg/PgBookingCard";

const UserPgBooking: React.FC = () => {
  const [pgBookings, setPgBookings] = useState<PgBookingBodyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getPgBookings = async (registerId: string | null) => {
    setLoading(true);
    if (!registerId) {
      setError("Register ID is missing.");
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const pgBooking = await fetchPgBookingsByRegisterId(registerId);
      console.log(pgBooking);
      if (Array.isArray(pgBooking)) {
        setPgBookings(
          pgBooking.filter((booking) => booking.pgDetail[0].isVerified)
        );
      } else if (pgBooking && typeof pgBooking === "object") {
        if (pgBooking.isVerified) {
          setPgBookings([pgBooking]);
        } else {
          setPgBookings([]);
        }
      } else {
        setPgBookings([]);
      }
    } catch (err) {
      setError("Failed to fetch Bookings");
      console.error(err);
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
          } else if (registerId._id) {
            getPgBookings(registerId._id);
          }
        } catch (error) {
          console.error(error);
          navigate("/");
        }
      };
      fetchRegisterIdAndBookings();
    }
  }, [navigate]);

  if (loading) {
    return <Loading size={50} />;
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  // Check if pgBookings is empty
  if (pgBookings.length === 0) {
    return (
      <div className="bg-white pt-24 px-5 md:px-8 lg:px-14 mb-10">
        <div className="w-full">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-blue-500">Pg Booking</h2>
          </div>
          {/* No bookings message */}
          <div className="text-center">
            <p className="text-lg font-semibold">No booking found</p>
            <button
              onClick={() => navigate("/allavailablepg")}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              View Available PGs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-24 px-5 md:px-8 lg:px-14 mb-10">
      <div className="w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-blue-500">Pg Booking</h2>
        </div>

        {/* Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pgBookings.map((pgBooking) => (
            <PgBookingCard key={pgBooking._id} pgBooking={pgBooking} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPgBooking;
