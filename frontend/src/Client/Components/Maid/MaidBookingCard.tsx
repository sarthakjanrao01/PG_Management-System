import React from "react";
import { Booking as BookingModel } from "../../../Shared/Models/Booking.model";

interface MaidBookingCardProps {
  booking: BookingModel;
}

const MaidBookingCard: React.FC<MaidBookingCardProps> = ({ booking }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-center">
      {/* Circular Image Container */}
      <div className="flex justify-center items-center mt-6">
        {booking.providerProfileDetail?.[0]?.profile_pic ? (
          <img
            src={booking.providerProfileDetail[0].profile_pic}
            alt="Maid"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500">
            <span className="text-gray-500">No Photo</span>
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div className="p-4">
        <p className="text-lg font-semibold">Booking ID: {booking._id}</p>
        <p className="text-sm text-gray-600">
          User Name: {booking.userDetail?.[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Provider Name: {booking.providerDetail?.[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Maid Gender: {booking.gender || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Category: {booking.category?.[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Sub Category: {booking.subcategory?.[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Start Date:{" "}
          {booking.start_date
            ? new Date(booking.start_date).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Status: {booking.status || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default MaidBookingCard;