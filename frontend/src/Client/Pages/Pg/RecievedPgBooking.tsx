import React, { useEffect, useState } from "react";
import Loading from "../../../Shared/Components/Loading"; // Import the Loading component
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { PgBookingBody } from "../../../Shared/Models/PgBooking.model";
import {
  fetchPgBookingsByPgId,
  updatePgBookingStatus,
} from "../../../Shared/Store/PgBookingAuthStore";
import PgRequestedUserCard from "../../Components/Pg/PgRequestedUserCard";
import { useNavigate } from "react-router-dom";

const RecievedPgBooking: React.FC = () => {
  const [pgBookings, setPgBookings] = useState<PgBookingBody[]>([]);
  const [registerId, setRegisterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch logged-in user
  useEffect(() => {
    const checkLoggedInUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if(token){
          const register = await getLoggedInUser();
          if (register.role === "pgOwner") {
            setRegisterId(register._id);
          }
          else{
            navigate("/");
          }
        }
        else{
          navigate("/login");
        }
        
      } catch (error) {
        console.error("Error checking logged-in user:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Fetch PG Bookings once registerId is set
  useEffect(() => {
    if (registerId) {
      const getPgBookings = async () => {
        setLoading(true);
        try {
          const data = await fetchPgBookingsByPgId(registerId);
          console.log(data);
          setPgBookings(data);
        } catch (err) {
          setError("Failed to fetch bookings");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getPgBookings();
    }
  }, [registerId]);

  // Handle PG Status Change
  const handleEdit = async (pgId: string) => {
    if (window.confirm("Are you sure you want to Approve Booking?")) {
      setLoading(true);
      try {
        await updatePgBookingStatus(pgId, "Confirmed");
        setPgBookings((prevPgs) =>
          prevPgs.map((pg) =>
            pg._id === pgId ? { ...pg, status: "Confirmed" } : pg
          )
        );
      } catch (error) {
        console.error("Error changing status:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle PG Deletion
  const handleDelete = async (pgId: string) => {
    if (window.confirm("Are you sure you want to Canceled this Booking?")) {
      setLoading(true);
      try {
        await updatePgBookingStatus(pgId, "Canceled");
        setPgBookings((prevPgs) =>
          prevPgs.map((pg) =>
            pg._id === pgId ? { ...pg, status: "Canceled" } : pg
          )
        );
      } catch (error) {
        console.error("Error deleting Pg:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading indicator
  if (loading) {
    return (
      <div className="pt-20 px-14 text-center animate-pulse">
        <Loading size={50} />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="pt-24 text-center text-red-500 animate-fade-in">
        {error}
      </div>
    );
  }

  // Prepare table data
  const data = pgBookings.map((pg, index) => ({
    No: index + 1,
    _id: pg._id,
    price: pg.pgDetail[0]?.price || "N/A",
    profilePic: pg.userProfileDetail[0]?.profile_pic || "",
    pgId: pg.name,
    gender: pg.gender || "N/A",
    address: `${pg.pgDetail[0]?.address || ""}, ${
      pg.pgDetail[0]?.street || ""
    }, ${pg.pgDetail[0]?.city || ""}, ${pg.pgDetail[0]?.state || ""}, ${
      pg.pgDetail[0]?.country || ""
    } - ${pg.pgDetail[0]?.pincode || ""}`,
    paymentStatus: pg.payment_status || "Pending",
    status: pg.status || "Pending",
    start_date: new Date(pg.start_date).toLocaleDateString("en-GB"), // Format: DD/MM/YYYY
    createdAt: pg.createdAt
      ? new Intl.DateTimeFormat("en-GB").format(new Date(pg.createdAt))
      : "N/A",
  }));

  console.log(pgBookings);

  return (
    <div className="pt-28 mb-10 md:px-14">
      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((pg, index) => (
            <div
              key={pg._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PgRequestedUserCard
                profilePic={pg.profilePic}
                name={pg.pgId}
                street={pg.address.split(", ")[0]}
                city={pg.address.split(", ")[1]}
                state={pg.address.split(", ")[2]}
                country={pg.address.split(", ")[3]}
                pincode={pg.address.split(", ")[4]}
                bookingId={pg._id}
                price={pg.price}
                gender={pg.gender}
                paymentStatus={pg.paymentStatus}
                status={pg.status}
                startDate={pg.start_date}
                applyDate={pg.createdAt}
                onApprove={() => handleEdit(pg._id)}
                onCancel={() => handleDelete(pg._id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg mt-10">
          No PG bookings received
        </div>
      )}
    </div>
  );
};

export default RecievedPgBooking;
