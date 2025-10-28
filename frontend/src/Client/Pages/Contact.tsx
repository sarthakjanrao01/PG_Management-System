import React, { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { createContactUs } from "../../Shared/Store/ContactAuthStore";
import Loading from "../../Shared/Components/Loading";

const ContactUs: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!name || !email || !message) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setSuccess("");

    try {
      await createContactUs({ name, email, message });
      alert("SuccessFully Sent Message")
      setSuccess("Your message has been sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      alert("Failed to Send Message");
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if(loading)
  {
    return <Loading size={50} />
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-6">
          Get in Touch with Us
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Have questions? We're here to help! Reach out to us for inquiries
          about maid hiring or PG rentals.
        </p>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
          <div className="flex flex-col items-center">
            <FaMapMarkerAlt className="text-blue-500 w-10 h-10 mb-2" />
            <p className="font-semibold">Himatnagar, Gujarat, India</p>
          </div>
          <div className="flex flex-col items-center">
            <FaPhoneAlt className="text-blue-500 w-10 h-10 mb-2" />
            <p className="font-semibold">+91 9499756925</p>
          </div>
          <div className="flex flex-col items-center">
            <FaEnvelope className="text-blue-500 w-10 h-10 mb-2" />
            <p className="font-semibold">matangievent@gmail.com</p>
          </div>
        </div>

        {/* Contact Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center font-medium">{error}</div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-500 text-center font-medium">
              {success}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg mt-1"
              rows={4}
              placeholder="Enter your message"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-blue-300"
            disabled={loading}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;