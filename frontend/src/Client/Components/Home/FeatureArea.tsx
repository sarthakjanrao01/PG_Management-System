import React from "react";
import { motion } from "framer-motion";

const FeatureArea: React.FC = () => {
  return (
    <div className="md:px-6 feature-area style-1 relative overflow-hidden bg-gradient-to-r from-blue-500 to-teal-400 py-20">
      <div className="container mx-auto px-4">
        <div className="feature-area-wrapper">
          {/* Section Title */}
          <div className="flex justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="sec-content">
                <span className="short-title text-orange-500 font-bold uppercase tracking-wider text-lg">
                  PROFESSIONAL SERVICE
                  <img
                    className="inline ml-2"
                    src="/images/icon/section-title.png"
                    alt="section-title"
                  />
                </span>
                <h2 className="title text-4xl md:text-5xl font-extrabold mt-4 text-white">
                  Cleaning Service at <br />
                  Your Door
                </h2>
              </div>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-wrap justify-center mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="w-full sm:w-1/2 lg:w-1/4 p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="info-card bg-white shadow-xl rounded-lg p-6 text-center transform transition-transform hover:scale-105 hover:shadow-2xl">
                  <div className="info-card-inner">
                    <div className="content-wrapper">
                      <div className="title-wrapper mb-6">
                        <div className="icon mb-4 inline-block p-4 rounded-full shadow-lg">
                          <img
                            src={feature.icon}
                            alt={feature.title}
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <h3 className="title text-2xl font-semibold text-blue-600">
                          {feature.title}
                        </h3>
                      </div>
                      <div className="content mt-4">
                        <p className="desc text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature data for mapping
const features = [
  {
    icon: "/images/icon/feature/icon-1.png",
    title: "Quality Service",
    description:
      "We provide top-notch cleaning services for homes and offices to keep your space spotless.",
  },
  {
    icon: "/images/icon/feature/icon-2.png",
    title: "Expert Team",
    description:
      "Our team is composed of trained and certified cleaning professionals who deliver exceptional results every time.",
  },
  {
    icon: "/images/icon/feature/icon-3.png",
    title: "Latest Equipments",
    description:
      "We use the latest cleaning technologies and equipment to make sure your place is not only clean but sanitized.",
  },
  {
    icon: "/images/icon/feature/icon-4.png",
    title: "Affordable Price",
    description:
      "Enjoy high-quality cleaning services at affordable rates. We offer flexible pricing plans to fit your budget.",
  },
];

export default FeatureArea;
