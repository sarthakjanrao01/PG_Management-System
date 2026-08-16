import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaBroom } from "react-icons/fa";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import { FiSearch, FiTrash2, FiMail, FiPhone } from "react-icons/fi";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  mobile_number?: number;
  subject?: string;
  message: string;
  createdAt: string;
}

const UserHelp: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadHelpData();
  }, []);

  const loadHelpData = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        const role = (user.role || "").toLowerCase();
        if (role === "superadmin") {
          setIsSuperAdmin(true);
          const res = await axiosInstance.get("/contactus").catch(() => ({ data: [] }));
          setMessages(res.data || []);
        } else {
          setIsSuperAdmin(false);
        }
      }
    } catch (err) {
      console.error("Error loading help data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject || "").toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, searchTerm]);

  const handleDeleteMessage = async (msgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const toastId = toast.loading("Deleting contact inquiry...");
    try {
      await axiosInstance.delete(`/contactus/delete/${msgId}`);
      toast.success("Inquiry message deleted successfully!", { id: toastId });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting contact inquiry:", err);
      toast.error("Failed to delete inquiry message.", { id: toastId });
    }
  };

  const handleOpenDrawer = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setDrawerOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isSuperAdmin ? "Support & Contact Desk (Super Admin)" : "Help & Emergency Contact Center"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSuperAdmin
              ? "Review and manage all user inquiries and contact requests submitted through the system."
              : "Get in touch with PG property owner, maintenance staff, and emergency helpline."}
          </p>
        </div>

        {/* Regular User Helpline Cards */}
        {!isSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}

        {/* Super Admin Support Messages Desk */}
        {isSuperAdmin && (
          <>
            {/* Search Input Toolbar */}
            {messages.length > 0 && (
              <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, email, subject, message..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 hover:text-slate-600 bg-slate-200 px-1 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Classic Clean Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {filteredMessages.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-sm">
                  <h3 className="text-base font-bold text-slate-700">No Contact Messages Found</h3>
                  <p className="text-xs text-slate-500 mt-1">There are no user support messages matching your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <th className="p-3.5 pl-5">Sender Name</th>
                        <th className="p-3.5">Email & Phone</th>
                        <th className="p-3.5">Subject / Message</th>
                        <th className="p-3.5">Date Received</th>
                        <th className="p-3.5 text-right pr-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMessages.map((msg) => (
                        <tr
                          key={msg._id}
                          onClick={() => handleOpenDrawer(msg)}
                          className="hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <td className="p-3.5 pl-5 font-semibold text-slate-800 group-hover:text-purple-600 transition">
                            {msg.name}
                          </td>
                          <td className="p-3.5 text-slate-600 text-xs font-medium">
                            <div className="text-slate-700 font-semibold">{msg.email}</div>
                            {msg.mobile_number && <div className="text-slate-400">{msg.mobile_number}</div>}
                          </td>
                          <td className="p-3.5 max-w-xs truncate text-slate-600 text-xs">
                            <span className="font-bold text-slate-800 mr-1">{msg.subject || "General Inquiry"}:</span>
                            {msg.message}
                          </td>
                          <td className="p-3.5 text-slate-600 text-xs font-medium">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenDrawer(msg)}
                                className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition"
                              >
                                View Message
                              </button>
                              <button
                                onClick={(e) => handleDeleteMessage(msg._id, e)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedMsg ? `Inquiry from ${selectedMsg.name}` : "Support Message"}
        subtitle="Contact Us inquiry submission details."
      >
        {selectedMsg && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-purple-700 uppercase">Contact Submission</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{selectedMsg.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Received on {new Date(selectedMsg.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Sender Contact Info</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Email Address</span>
                  <a href={`mailto:${selectedMsg.email}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <FiMail />
                    {selectedMsg.email}
                  </a>
                </div>
                {selectedMsg.mobile_number && (
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Mobile Number</span>
                    <a href={`tel:${selectedMsg.mobile_number}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                      <FiPhone />
                      {selectedMsg.mobile_number}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Subject & Message</h4>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-xs font-bold text-purple-700 uppercase">{selectedMsg.subject || "General Inquiry"}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedMsg.message}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <a
                href={`mailto:${selectedMsg.email}?subject=RE: ${encodeURIComponent(selectedMsg.subject || "PG Inquiry")}`}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm shadow transition flex items-center justify-center gap-2"
              >
                <FiMail />
                Reply via Email
              </a>
              <button
                onClick={() => handleDeleteMessage(selectedMsg._id)}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs border border-rose-200 transition flex items-center justify-center gap-1.5"
              >
                <FiTrash2 />
                Delete Inquiry Record
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserHelp;
