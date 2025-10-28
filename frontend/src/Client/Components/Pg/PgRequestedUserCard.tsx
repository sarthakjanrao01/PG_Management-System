import React from "react";

interface PgRequestedUserCardProps {
  profilePic: string;
  name: string;
  price: string | number;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  bookingId: string;
  gender: string;
  paymentStatus: string;
  status: string;
  startDate: string;
  applyDate: string;
  onApprove: () => void;
  onCancel: () => void;
}

const PgRequestedUserCard: React.FC<PgRequestedUserCardProps> = ({
  profilePic,
  name,
  price,
  street,
  city,
  state,
  country,
  pincode,
  bookingId,
  gender,
  paymentStatus,
  status,
  startDate,
  applyDate,
  onApprove,
  onCancel,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-96 mx-auto text-center border">
      {/* Profile Picture */}
      <div className="flex justify-center">
        <img
          src={profilePic}
          alt="User"
          className="w-24 h-24 rounded-full border-4 border-gray-300 object-cover"
        />
      </div>

      {/* User Details */}
      <h2 className="text-xl font-bold mt-4">{name}</h2>
      {/* <p className="text-gray-500">{email}</p> */}
      {/* <p className="text-gray-500">{contact}</p> */}

      {/* Booking Details */}
      <div className="mt-4 text-gray-700">
        <p><strong>Booking ID:</strong> {bookingId}</p>
        <p><strong>Price:</strong> {price}</p>
        <p><strong>Gender:</strong> {gender}</p>
        <p><strong>Payment Status:</strong> {paymentStatus}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            status === "Confirmed" ? "bg-green-100 text-green-600" 
            : status === "Canceled" ? "bg-red-100 text-red-600" 
            : "bg-yellow-100 text-yellow-600"
          }`}>
            {status}
          </span>
        </p>
        <p><strong>Start Date:</strong> {startDate}</p>
        <p><strong>Apply Date:</strong> {applyDate}</p>
      </div>

      {/* Address Section */}
      <div className="mt-4 text-gray-700">
        <p><strong>Address:</strong></p>
        <p>{street}, {city}</p>
        <p>{state}, {country} - {pincode}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-6 space-x-4">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={onApprove}
        >
          Approve
        </button>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PgRequestedUserCard;