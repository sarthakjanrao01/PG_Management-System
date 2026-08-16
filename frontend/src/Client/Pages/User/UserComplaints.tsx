import React, { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import { FiSearch, FiTrash2, FiCheckCircle } from "react-icons/fi";

interface ComplaintItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  user_reviewed?: boolean;
  resolution_note?: string;
  createdAt: string;
  userDetail?: { name: string; email: string }[];
  roomDetail?: { room_no: string }[];
}

interface TenancyDetails {
  _id: string;
  pg_id: string;
  room_id: string;
  roomDetail?: { _id: string }[];
}

const UserComplaints: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [tenancy, setTenancy] = useState<TenancyDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states (User)
  const [category, setCategory] = useState("Maintenance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Toolbar & Expandable Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [clearing, setClearing] = useState(false);

  // Drawer & Admin Response state
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    loadUserComplaints();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUserComplaints = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user._id);
        const role = (user.role || "").toLowerCase();
        if (role === "superadmin") {
          setIsSuperAdmin(true);
          const res = await axiosInstance.get("/complaint/pg/all").catch(() => ({ data: [] }));
          setComplaints(res.data || []);
        } else {
          setIsSuperAdmin(false);
          const [complaintRes, tenancyRes] = await Promise.all([
            axiosInstance.get(`/complaint/user/${user._id}`),
            axiosInstance.get(`/tenancy/user/${user._id}`).catch(() => ({ data: null })),
          ]);
          setComplaints(complaintRes.data || []);

          const tenancies = Array.isArray(tenancyRes.data)
            ? tenancyRes.data
            : tenancyRes.data
            ? [tenancyRes.data]
            : [];
          setTenancy(tenancies[0] || null);
        }
      }
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter === "pending" && (c.status === "Resolved" || c.status === "Accepted")) return false;
      if (statusFilter === "accepted" && c.status !== "Accepted") return false;
      if (statusFilter === "resolved" && c.status !== "Resolved") return false;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;

      const titleMatch = c.title.toLowerCase().includes(q);
      const catMatch = c.category.toLowerCase().includes(q);
      const userMatch = c.userDetail?.[0]?.name?.toLowerCase().includes(q) || false;
      const roomMatch = c.roomDetail?.[0]?.room_no?.toLowerCase().includes(q) || false;

      return titleMatch || catMatch || userMatch || roomMatch;
    });
  }, [complaints, statusFilter, searchTerm]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please provide a title and detailed description.");
      return;
    }
    if (!tenancy) {
      toast.error("You must have an active room tenancy to lodge a complaint.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting complaint to PG Owner...");

    try {
      await axiosInstance.post("/complaint/create", {
        user_id: userId,
        pg_id: tenancy.pg_id,
        room_id: tenancy.room_id,
        category,
        title,
        description,
      });

      toast.success("Complaint submitted successfully! PG Owner notified.", { id: toastId });
      setTitle("");
      setDescription("");
      loadUserComplaints();
    } catch (err) {
      console.error("Error submitting complaint:", err);
      toast.error("Failed to submit complaint. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (complaintId: string, nextStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const toastId = toast.loading(`Marking complaint as ${nextStatus}...`);

    try {
      await axiosInstance.put(`/complaint/${complaintId}`, {
        status: nextStatus,
        resolution_note: resolutionNote || undefined,
        owner_id: userId,
      });

      toast.success(`Complaint status updated to ${nextStatus}!`, { id: toastId });
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: nextStatus, resolution_note: resolutionNote || c.resolution_note } : c))
      );
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint((prev) => prev ? { ...prev, status: nextStatus, resolution_note: resolutionNote || prev.resolution_note } : null);
      }
    } catch (err) {
      console.error("Error updating complaint status:", err);
      toast.error("Failed to update complaint status.", { id: toastId });
    }
  };

  const handleDeleteSingleComplaint = async (complaintId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const toastId = toast.loading("Deleting complaint...");
    try {
      await axiosInstance.delete(`/complaint/${complaintId}`);
      toast.success("Complaint deleted successfully!", { id: toastId });
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting complaint:", err);
      toast.error("Failed to delete complaint.", { id: toastId });
    }
  };

  const handleClearAllComplaints = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 font-sans">
        <p className="font-black text-rose-600 text-sm">Delete ALL Complaints?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete all system complaints from the database?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs bg-slate-100 font-semibold rounded-lg text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setClearing(true);
              const toastId = toast.loading("Deleting all complaints...");
              try {
                await axiosInstance.delete("/complaint/clear-all");
                toast.success("All complaints deleted successfully!", { id: toastId });
                setComplaints([]);
                setDrawerOpen(false);
              } catch (err) {
                console.error("Error deleting all complaints:", err);
                toast.error("Failed to clear complaints.", { id: toastId });
              } finally {
                setClearing(false);
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Clear
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const handleOpenDrawer = (c: ComplaintItem) => {
    setSelectedComplaint(c);
    setResolutionNote(c.resolution_note || "");
    setDrawerOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isSuperAdmin ? "System Complaints Desk (Super Admin)" : "Complaints & Maintenance Notes"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isSuperAdmin
                ? "Global management of all tenant complaints across all PG properties."
                : "Raise issues directly to the PG owner. Updates will be visible in real-time."}
            </p>
          </div>
          {isSuperAdmin && complaints.length > 0 && (
            <button
              onClick={handleClearAllComplaints}
              disabled={clearing}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition border border-rose-200 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <FiTrash2 />
              {clearing ? "Deleting..." : "Clear All Complaints"}
            </button>
          )}
        </div>

        {/* User Log New Complaint Form */}
        {!isSuperAdmin && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Log New Complaint / Issue</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Maintenance">Plumbing / Electricity / Maintenance</option>
                  <option value="Cleaning">Housekeeping & Cleaning</option>
                  <option value="Food / Mess">Mess / Food Quality</option>
                  <option value="WiFi / Internet">WiFi & Internet Connection</option>
                  <option value="Security">Security & Access</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tap leaking in bathroom, WiFi not connecting..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details about the issue..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md disabled:bg-blue-300"
                >
                  {submitting ? "Submitting..." : "Submit Complaint to Owner"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        {complaints.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search issue title, tenant, room..."
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

            {/* Expandable Filter Dropdown Button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center justify-between sm:justify-start gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter Complaints</span>
                  {statusFilter !== "all" && (
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                  )}
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Status Filter</div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={statusFilter === "all"}
                        onChange={() => setStatusFilter("all")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>All Issues</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={statusFilter === "pending"}
                        onChange={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Pending Only</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={statusFilter === "accepted"}
                        onChange={() => setStatusFilter(statusFilter === "accepted" ? "all" : "accepted")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Accepted Only</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={statusFilter === "resolved"}
                        onChange={() => setStatusFilter(statusFilter === "resolved" ? "all" : "resolved")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Resolved Only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complaints History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredComplaints.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <h3 className="text-base font-bold text-slate-700">No Complaints Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no complaints matching your active filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Issue Title & Category</th>
                    {isSuperAdmin && <th className="p-3.5">Raised By</th>}
                    <th className="p-3.5">Date Logged</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => handleOpenDrawer(c)}
                      className="hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                          {c.title}
                        </div>
                        <div className="text-xs text-slate-400 font-normal uppercase">
                          {c.category}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="p-3.5 text-slate-600 text-xs font-medium">
                          {c.userDetail?.[0]?.name || "Tenant"}
                        </td>
                      )}
                      <td className="p-3.5 text-slate-600 text-xs font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded ${
                            c.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700"
                              : c.status === "Accepted"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && c.status !== "Resolved" && (
                            <button
                              onClick={(e) => handleUpdateStatus(c._id, c.status === "Accepted" ? "Resolved" : "Accepted", e)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                c.status === "Accepted"
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                              }`}
                            >
                              {c.status === "Accepted" ? "Resolve" : "Accept"}
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={(e) => handleDeleteSingleComplaint(c._id, e)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                            >
                              Delete
                            </button>
                          )}
                          {!isSuperAdmin && (
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedComplaint ? selectedComplaint.title : "Complaint Details"}
        subtitle="Review complaint details and manage resolution notes."
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-blue-600 uppercase">{selectedComplaint.category}</span>
              <h3 className="text-xl font-black text-slate-800 mt-1">{selectedComplaint.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Logged on {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Issue Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Super Admin Status Management */}
            {isSuperAdmin && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Resolution Response & Status</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Resolution Note / Instructions</label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Write a resolution note or update for the tenant..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-purple-500 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedComplaint._id, "Accepted")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition"
                  >
                    Mark as Accepted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedComplaint._id, "Resolved")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition"
                  >
                    Mark as Resolved
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteSingleComplaint(selectedComplaint._id)}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs border border-rose-200 transition flex items-center justify-center gap-1.5"
                >
                  <FiTrash2 />
                  Delete Complaint Record
                </button>
              </div>
            )}

            {!isSuperAdmin && selectedComplaint.resolution_note && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Owner Note / Response</h4>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  {selectedComplaint.resolution_note}
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserComplaints;
