import React from "react";
import { PgBookingBody as PgBookingBodyModel } from "../../../Shared/Models/PgBooking.model";
import { Link } from "react-router-dom";

interface PgBookingCardProps {
  pgBooking: PgBookingBodyModel;
}

const PgBookingCard: React.FC<PgBookingCardProps> = ({ pgBooking }) => {
  return (
    <Link
      to={`/pgdetail?pg_id=${pgBooking.pgDetail?.[0]?._id}`} // Adjust the route as per your PG details page
      className="block bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
    >
      {/* PG Photo */}
      {pgBooking.pgDetail?.[0]?.image1 ? (
        <img
          src={pgBooking.pgDetail[0].image1}
          alt="PG"
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Photo Available</span>
        </div>
      )}

      {/* PG Details */}
      <div className="p-4 text-center">
        <p className="text-lg font-semibold">PG Booking ID: {pgBooking._id}</p>
        <p className="text-sm text-gray-600">
          PG Owner: {pgBooking.pgOwnerDetail?.[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Address:{" "}
          {`${pgBooking.pgDetail?.[0]?.address}, ${pgBooking.pgDetail?.[0]?.street}, ${pgBooking.pgDetail?.[0]?.city}, ${pgBooking.pgDetail?.[0]?.state}, ${pgBooking.pgDetail?.[0]?.country}`}
        </p>
        <p className="text-sm text-gray-600">
          Price: {pgBooking.pgDetail?.[0]?.price || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Gender: {pgBooking.gender || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Start Date:{" "}
          {pgBooking.start_date
            ? new Date(pgBooking.start_date).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Status: {pgBooking.status || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Payment Status: {pgBooking.payment_status || "N/A"}
        </p>
      </div>
    </Link>
  );
};

export default PgBookingCard;
