import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-blue-500 px-4 sm:px-6 md:px-12 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          {/* Footer Left Section */}
          <div className="mb-3 sm:mb-0">
            <h1 className="text-lg md:text-xl font-semibold">Matangi Event</h1>
          </div>

          {/* Footer Right Section */}
          <div className="text-sm">
            <p>© {new Date().getFullYear()} Matangi Event. All Rights Reserved.</p>
            <p className="mt-1">
              Designed by{" "}
              <Link
                to="https://matangievent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition duration-200 font-medium"
              >
                Sweta Patel
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;