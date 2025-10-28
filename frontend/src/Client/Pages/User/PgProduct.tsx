import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPgsById } from "../../../Shared/Store/PgAuthStore";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { Pg as PgModel } from "../../../Shared/Models/Pg.model";
import Loading from "../../../Shared/Components/Loading";
import {
  checkBookingExists,
  createPgBooking,
} from "../../../Shared/Store/PgBookingAuthStore";
import { fetchProfileByRegisterId } from "../../../Shared/Store/ProfileAuthStore";
import {
  createPgPaymentOrder,
  pgPaymentVerify,
} from "../../../Shared/Store/PgPaymentAuthStore";
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const PgProduct: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string>("");
  const [pgOwnerId, setPgOwnerId] = useState<string | null>(null);
  const [pgData, setPgData] = useState<PgModel | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    start_date: "",
  });
  const [buttonText, setButtonText] = useState("Book Now");

  const searchParams = new URLSearchParams(location.search);
  const pg_id = searchParams.get("pg_id");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const checkUserAuthentication = async () => {
        const register = await getLoggedInUser();
        try {
          if (!register) {
            navigate("/login");
          } else {
            try {
              setUserId(register._id); // User Id who is now logged in
              if (pg_id) {
                const pgData = await fetchPgsById(pg_id);
                // console.log(pgData);
                setPgOwnerId(pgData.userDetail[0]._id); // PG Owner Id
                setPgData(pgData);
                setSelectedImage(pgData.image1);
              } else {
                console.error("PG ID is undefined");
              }
            } catch (error) {
              console.error("Error fetching PG details:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching logged-in user", error);
          navigate("/");
        }
      };
      checkUserAuthentication();
    } else {
      navigate("/login");
    }
  }, [navigate, pg_id]);

  if (!pgData)
    return (
      <div className="pt-24">
        <Loading size={50} />
      </div>
    );

  const images = [
    pgData?.image1,
    pgData?.image2,
    pgData?.image3,
    pgData?.image4,
    pgData?.image5,
  ].filter(Boolean);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  interface BookingData {
    user_id: string;
    provider_id: string;
    pg_id: string;
    start_date: Date;
    name: string;
    gender: string;
    payment_status: string;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID is not available. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const checkUserProfile = await fetchProfileByRegisterId(userId);
      console.log("User Profile:", checkUserProfile.status);
      if (checkUserProfile.status === 404) {
        alert("User not found. Please complete your profile.");
        navigate("/profile"); // Navigate to the profile page
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Please Complete Profile First");
      navigate("/profile"); // Navigate to the profile page
      return;
    }

    const bookingData: BookingData = {
      ...formData,
      user_id: userId || "", // Logged-in user ID
      provider_id: pgOwnerId || "", // PG Owner ID
      pg_id: pg_id || "", // PG ID
      start_date: new Date(formData.start_date),
      payment_status: "Pending",
    };

    console.log("Booking Data:", bookingData);

    if (buttonText === "Book Now") {
      try {
        await createPgBooking(bookingData);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Booking Error:", error.message);
          alert(error.message);
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred.");
        }
      }
    }
    if (buttonText === "Reserve Now") {
      try {
        await checkBookingExists(bookingData);
        const pgOrder = await createPgPaymentOrder(pgData.price);
        handlePaymentVerify(pgOrder, bookingData);
      } catch (error) {
        // Ensure error is an object before accessing properties
        if (typeof error === "object" && error !== null && "status" in error) {
          const err = error as {
            status?: number;
            response?: { data?: { message?: string } };
          };

          if (err.status === 409) {
            alert("You have Already Booked Pg");
          } else {
            console.error("Booking Error:", err);
            alert(
              err.response?.data?.message || "An unexpected error occurred."
            );
          }
        } else {
          console.error("Unknown Error:", error);
          alert("An unknown error occurred. Please try again.");
        }
      }
    }
  };

  // interface PgPaymentResponseBody{
  //   razorpay_order_id: string;
  //   razorpay_payment_id: string;
  //   razorpay_signature: string;
  // }

  type PgData = {
    data: {
      amount: number;
      currency: string;
      id: string;
    };
  };

  type Response = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  const handlePaymentVerify = async (
    pgData: PgData,
    bookingData: BookingData
  ) => {
    const options = {
      key: import.meta.env.RAZORPAY_KEY_ID,
      amount: pgData.data.amount,
      currency: pgData.data.currency,
      name: "Sweta Patel",
      description: "Test Mode",
      order_id: pgData.data.id,
      handler: async (response: Response) => {
        console.log("response", response);
        try {
          const res = await pgPaymentVerify({
            user_id: userId,
            pg_id: pg_id || "",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (res.message) {
            bookingData.payment_status = "Success";
            await createPgBooking(bookingData);
            alert("Payment Successful");
            navigate("/mypgbooking");
          } else {
            bookingData.payment_status = "Failed";
            alert("Payment Failed");
            navigate("/mypgbooking");
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
          alert("Payment verification failed. Check console for details.");
        }
      },
      theme: {
        color: "#5f63b8",
      },
    };

    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded. Please check your script.");
      return;
    }

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className="max-w-screen-xl px-6 md:px-14 pt-24 mb-10 mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Section - Images */}
      <div className="md:w-1/3">
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <img
            src={selectedImage || pgData.image1}
            alt="Selected"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-5 gap-2 mt-4">
          {images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`Thumbnail ${idx + 1}`}
              className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 ${
                selectedImage === image ? "border-blue-500" : "border-gray-300"
              }`}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      </div>

      {/* Middle Section - PG Info */}
      <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md space-y-4">
        <h1 className="text-3xl font-semibold">PG Details</h1>
        <div>
          <strong>Owner Name: </strong> <span>{pgData.userDetail[0].name}</span>
        </div>
        <div>
          <strong>Sub Category: </strong>{" "}
          <span>{pgData.subCategory[0]?.name}</span>
        </div>
        <div>
          <strong>PG Type: </strong> <span>{pgData.pgtype[0]?.name}</span>
        </div>
        <div>
          <strong>Address: </strong> <span>{pgData.address}</span>
        </div>
        <div>
          <strong>Street: </strong> <span>{pgData.street}</span>
        </div>
        <div>
          <strong>City: </strong> <span>{pgData.city}</span>
        </div>
        <div>
          <strong>State: </strong> <span>{pgData.state}</span>
        </div>
        <div>
          <strong>Country: </strong> <span>{pgData.country}</span>
        </div>
        <div>
          <strong>Pincode: </strong> <span>{pgData.pincode}</span>
        </div>
        <div>
          <strong>Verification: </strong>
          <span
            className={`${
              pgData.isVerified ? "text-green-500" : "text-red-500"
            }`}
          >
            {pgData.isVerified ? "Verified" : "Not Verified"}
          </span>
        </div>
        <div>
          <strong>Posted At:</strong>{" "}
          <span>{new Date(pgData.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Right Section - "Book Now" Form */}
      <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <button
            className={`${
              buttonText === "Book Now"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } px-4 py-2 rounded-lg font-semibold`}
            onClick={() => setButtonText("Book Now")}
          >
            Book Now
          </button>
          <button
            className={`${
              buttonText === "Reserve Now"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } px-4 py-2 rounded-lg font-semibold`}
            onClick={() => setButtonText("Reserve Now")}
          >
            Reserve Now
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block font-semibold">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="block font-semibold">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Start Date Field */}
          <div>
            <label className="block font-semibold">Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]} // Restrict past dates
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-lg">
              Price: {pgData.price}
            </label>
          </div>

          {/* Submit Button */}

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PgProduct;
