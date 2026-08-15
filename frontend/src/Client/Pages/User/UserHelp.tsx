import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaBroom } from "react-icons/fa";

const UserHelp: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Help & Emergency Contact Center</h1>
        <p className="text-slate-500 text-sm mb-8">
          Get in touch with PG property owner, maintenance staff, and emergency helpline.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* PG Owner Contact */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FaUserTie size="1.2rem" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-blue-600">Property Management</span>
                  <h3 className="text-xl font-bold text-slate-800">PG Owner Support</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-blue-500" />
                  <span>+91 9499756925</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-500" />
                  <span>support@pgmanagement.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>Main PG Office, Station Road, Gujarat, India</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Available: 8:00 AM – 10:00 PM</span>
            </div>
          </div>

          {/* Maintenance Staff Contact */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FaBroom size="1.2rem" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-emerald-600">On-Site Support</span>
                  <h3 className="text-xl font-bold text-slate-800">Staff & Maid Helpline</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-emerald-500" />
                  <span>+91 9876543210 (Housekeeping & Cleaning)</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-emerald-500" />
                  <span>+91 9123456789 (Plumbing & Electrical)</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-emerald-500" />
                  <span>staff@pgmanagement.com</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">24/7 On-Call Assistance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHelp;
