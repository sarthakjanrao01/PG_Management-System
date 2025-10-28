import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const SliderComponent: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="pt-16 slider-area relative overflow-hidden flex justify-center items-center bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-700">
      <div className="w-full max-w-6xl px-4 relative z-10">
        <Slider {...settings}>
          {/** First Slide */}
          <div className="single-slider-wrapper">
            <div className="container mx-auto min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col md:flex-row items-center justify-between relative">
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left p-4 md:p-8 z-10 order-2 md:order-1">
                <span className="slider-short-title text-white font-bold text-lg md:text-2xl uppercase tracking-widest">
                  Maid
                </span>
                <h1 className="slider-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-2 text-white leading-tight">
                  Leading the Cleaning Industry with Excellence
                </h1>
                <p className="slider-short-desc text-gray-50 mt-3 md:mt-6 text-sm sm:text-base md:text-lg">
                  Discover the best cleaning services that fit your needs. Quality, reliability, and trust.
                </p>
                <div className="mt-4 md:mt-6">
                  <Link
                    to="/aboutus"
                    className="theme-btn bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Explore Our Services
                  </Link>
                </div>
              </div>
              {/* Image */}
              <div className="flex-1 order-1 md:order-2 mb-6 md:mb-0">
                <img
                  src="/images/slider/slider-2.jpg"
                  alt="Slider 1"
                  className="w-full h-48 sm:h-64 md:h-auto object-cover rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 opacity-30"></div>
            </div>
          </div>

          {/** Second Slide */}
          <div className="single-slider-wrapper">
            <div className="container mx-auto min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col md:flex-row items-center justify-between relative">
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left p-4 md:p-8 z-10 order-2 md:order-1">
                <span className="slider-short-title text-white font-bold text-lg md:text-2xl uppercase tracking-widest">
                  Pg Rental
                </span>
                <h1 className="slider-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-2 text-white leading-tight">
                  Experts in PG Rentals and Management
                </h1>
                <p className="slider-short-desc text-white mt-3 md:mt-6 text-sm sm:text-base md:text-lg">
                  Offering premium PG rental services that match your lifestyle. Convenient and affordable.
                </p>
                <div className="mt-4 md:mt-6">
                  <Link
                    to="/aboutus"
                    className="theme-btn bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Learn More About Us
                  </Link>
                </div>
              </div>
              {/* Image */}
              <div className="flex-1 order-1 md:order-2 mb-6 md:mb-0">
                <img
                  src="/images/Pg/image.png"
                  alt="Slider 2"
                  className="w-full h-48 sm:h-64 md:h-auto object-cover rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 opacity-30"></div>
            </div>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default SliderComponent;

// Custom Navigation Arrows
const SampleNextArrow: React.FC<{ onClick?: () => void }> = (props) => {
  const { onClick } = props;
  return (
    <div
      className="slider-nav-next-btn absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 cursor-pointer"
      onClick={onClick}
    >
      <i className="fa-solid fa-angle-right text-2xl md:text-3xl text-orange-500"></i>
    </div>
  );
};

const SamplePrevArrow: React.FC<{ onClick?: () => void }> = (props) => {
  const { onClick } = props;
  return (
    <div
      className="slider-nav-prev-btn absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 cursor-pointer"
      onClick={onClick}
    >
      <i className="fa-solid fa-angle-left text-2xl md:text-3xl text-orange-500"></i>
    </div>
  );
};