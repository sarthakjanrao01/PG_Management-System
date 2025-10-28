import React from "react";
import { NavLink } from "react-router-dom";

const AboutUs: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 md:px-16 py-12">
      <div className="max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 animate-fade-in-up">
          Transforming the Way You Find <span className="text-blue-500">Maid Services</span> & <span className="text-teal-500">PG Rentals</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8 animate-fade-in-up delay-100">
          Welcome to <span className="font-semibold text-blue-500">Matangi Event</span> — a platform designed to simplify the search for reliable <span className="font-bold">maids</span> and <span className="font-bold">PG accommodations</span> in your city. Whether you are a busy professional, a student, or a family in need of trustworthy domestic help or a comfortable place to stay, we've got you covered!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Maid Hiring Section */}
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-left">
          <img src="/images/why-choose-us/image-1.jpg" alt="Maid Service" className="w-32 h-32 mb-4 rounded-full object-cover border-4 border-blue-200 hover:border-blue-500 transition-all duration-300" />
          <h2 className="text-2xl font-bold text-blue-500 mb-4">Maid Hiring Simplified</h2>
          <p className="text-gray-600">
            Say goodbye to unreliable services! Our vetted and professional maids are available at your convenience. Choose from a variety of services including <span className="font-bold">cleaning, cooking, babysitting, elderly care</span>, and more!
          </p>
        </div>
        
        {/* PG Rental Section */}
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-right">
          <img src="/images/Pg/image.png" alt="PG Rental" className="w-32 h-32 mb-4 rounded-full object-cover border-4 border-teal-200 hover:border-teal-500 transition-all duration-300" />
          <h2 className="text-2xl font-bold text-teal-500 mb-4">PG Rentals Made Easy</h2>
          <p className="text-gray-600">
            Finding the right <span className="font-bold">PG accommodation</span> has never been easier. Whether you’re a student, working professional, or traveler, we connect you with the best and most affordable PGs tailored to your needs.
          </p>
        </div>
      </div>
      
      {/* Why Choose Us? */}
      <div className="max-w-5xl text-center mt-12 animate-fade-in-up delay-200">
        <h2 className="text-3xl font-bold text-gray-800">Why Choose Us?</h2>
        <p className="text-gray-600 mt-4 mb-8">
          We bring you the most <span className="font-bold">trusted, verified, and affordable</span> maid services and PG accommodations under one roof. Experience a seamless, hassle-free, and transparent booking process today!
        </p>
      </div>
      
      {/* CTA Section */}
      <div className="mt-6 flex gap-6 animate-fade-in-up delay-300">
        <NavLink to="/maidbooking" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-110">
          Hire a Maid
        </NavLink>
        <NavLink to="/allavailablepg" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-110">
          Find a PG
        </NavLink>
      </div>
    </div>
  );
};

export default AboutUs;