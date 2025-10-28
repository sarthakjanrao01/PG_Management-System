import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AboutUsArea: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-16 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700">
      <img
        className="absolute top-0 left-0 w-12 h-12 opacity-30"
        src="images/shape/star.png"
        alt="shape"
      />
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Column (Images & Stats) */}
          <div className="relative flex flex-col items-center md:items-start">
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.img
                className="w-full max-w-xs md:max-w-md rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-500"
                src="images/about/about-card-img.jpg"
                alt="About Card"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
              />
            </motion.div>

            <div className="relative mt-6 flex space-x-4">
              <motion.img
                className="w-24 h-24 rounded-full shadow-lg transform hover:scale-105 transition-all duration-500"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                src="images/about/about-img-three.jpg"
                alt="About Image"
              />
              <img
                className="w-16 h-16 rounded-full border-4 border-white"
                src="images/about/about-img-two.jpg"
                alt="Circle Shape"
              />
            </div>
          </div>

          {/* Right Column (Text & Video) */}
          <div className="text-center md:text-left">
            <div className="mb-6">
              <span className="text-xl font-medium text-gray-300 flex justify-center md:justify-start items-center">
                ABOUT US
                <img
                  className="ml-2 w-6"
                  src="images/icon/section-title.png"
                  alt="Section Title"
                />
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-white mt-2">
                We Make Places <br /> Clean & Bright
              </h2>
            </div>

            <p className="text-gray-300 mb-6">
              We provide premium cleaning services that ensure your spaces shine
              like never before. Dedicated to providing excellence in every
              corner.
            </p>

            <ul className="space-y-2 text-gray-200 mb-6">
              <li className="hover:text-orange-400 transition">
                ✔ Expert cleaners with years of experience.
              </li>
              <li className="hover:text-orange-400 transition">
                ✔ Eco-friendly cleaning products and methods.
              </li>
              <li className="hover:text-orange-400 transition">
                ✔ Fast and affordable cleaning solutions.
              </li>
            </ul>

            <p className="text-gray-300 mb-6">
              Learn more about our cleaning process and how we maintain high
              standards to serve you better.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-center sm:text-left">
              <Link
                to="/aboutus"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Our Services
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center items-center space-x-3 text-gray-300 hover:text-white mt-4 sm:mt-0">
                <i className="fa-solid fa-phone text-xl bg-red-500"></i>
                <div>
                  <span className="block text-sm">Call Us</span>
                  <span className="block text-lg font-medium">
                    +123 - 456 - 7890
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsArea;