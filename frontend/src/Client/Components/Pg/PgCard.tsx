import React from "react";
import { useNavigate } from "react-router-dom";

interface PgCardProps {
  pgId: string;
  userId: string;
  providerRegId: string;
  title: string;
  location: string;
  price: string;
  features: string[];
  occupancy: string[];
  gender: string;
  image: string;
  status: string;
}

const PgCard: React.FC<PgCardProps> = ({
  pgId,
  title,
  location,
  price,
  features = [],
  occupancy,
  gender,
  image,
  status,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/pgdetail?pg_id=${pgId}`);
  };

  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.03]"
      onClick={handleCardClick}
    >
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden relative transition-shadow duration-300 hover:shadow-2xl">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {status}
          </span>
          <span className="absolute top-3 right-3 bg-pink-100 text-pink-600 text-xs font-medium px-3 py-1 rounded-full shadow-md">
            {gender}
          </span>
        </div>

        {/* Details Section */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-500 text-sm mb-3">{location}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-3">
            {features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{features.length - 3} more
              </span>
            )}
          </div>

          {/* Occupancy */}
          <div className="flex flex-wrap gap-2 mb-3">
            {occupancy.map((type, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>

          {/* Price & Button */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-lg font-bold text-gray-900">
              Starts from <span className="text-blue-500">{price}</span>
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/pgdetail?pg_id=${pgId}`);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 shadow-md"
            >
              View PG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PgCard;