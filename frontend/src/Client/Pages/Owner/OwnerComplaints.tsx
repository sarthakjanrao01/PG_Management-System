import React, { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import { FiSearch, FiTrash2 } from "react-icons/fi";

interface ComplaintItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  user_reviewed?: boolean;
  resolution_note?: string;
  createdAt: string;
  userDetail?: { name: string; email: string; phone: string }[];
  roomDetail?: { room_no: string; floor: number }[];
}

const OwnerComplaints: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState("");
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [updating, setUpdating] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "resolved">("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadComplaints();
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

  const loadComplaints = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setOwnerId(user._id);
        const res = await axiosInstance.get("/complaint/pg/all");
        setComplaints(res.data || []);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Error loading room issues:", err);
    } finally {
      setLoading(false);
    }
  };

  // Instant Filter & Search logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const query = searchTerm.toLowerCase().trim();
      const user = c.userDetail?.[0];
      const room = c.roomDetail?.[0];

      const matchesSearch =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        (user?.name || "").toLowerCase().includes(query) ||
        (room?.room_no || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterStatus === "pending") return c.status === "Pending";
      if (filterStatus === "accepted") return c.status === "Accepted";
      if (filterStatus === "resolved") return c.status === "Resolved";

      return true;
    });
  }, [complaints, searchTerm, filterStatus]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComplaints.map((c) => c._id));
    }
  };

  const handleOpenComplaintDrawer = (c: ComplaintItem) => {
    setSelectedComplaint(c);
    setActionNote(c.resolution_note || "");
    setDrawerOpen(true);
  };

  const handleUpdateStatus = async (status: "Accepted" | "Resolved") => {
    if (!selectedComplaint) return;
    setUpdating(true);
    const toastId = toast.loading(`Updating status to ${status}...`);

    try {
      await axiosInstance.put(`/complaint/${selectedComplaint._id}`, {
        status,
        resolution_note: actionNote,
        owner_id: ownerId,
      });

      toast.success(`Complaint marked as ${status}! Tenant notified.`, { id: toastId });
      setDrawerOpen(false);
      loadComplaints();
    } catch (err) {
      console.error("Error updating complaint status:", err);
      toast.error("Failed to update complaint status.", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSingle = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-sm">Delete Complaint "{title}"?</p>
        <p className="text-xs text-slate-500">This action cannot be undone.</p>
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
              const toastId = toast.loading("Deleting complaint...");
              try {
                await axiosInstance.delete(`/complaint/${id}`);
                toast.success("Complaint deleted successfully!", { id: toastId });
                setDrawerOpen(false);
                loadComplaints();
              } catch (err) {
                console.error("Error deleting complaint:", err);
                toast.error("Failed to delete complaint.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-black text-rose-600 text-sm">Delete {selectedIds.length} Selected Complaint(s)?</p>
        <p className="text-xs text-slate-600">Selected complaint records will be permanently removed.</p>
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
              const toastId = toast.loading(`Deleting ${selectedIds.length} complaints...`);
              try {
                await Promise.all(selectedIds.map((id) => axiosInstance.delete(`/complaint/${id}`)));
                toast.success(`Deleted ${selectedIds.length} selected complaints!`, { id: toastId });
                loadComplaints();
              } catch (err) {
                console.error("Error deleting selected complaints:", err);
                toast.error("Failed to delete selected complaints.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Delete Selected
          </button>
        </div>
      </div>
    ), { duration: 7000 });
  };

  const handleDeleteAll = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-black text-rose-600 text-sm">Delete ALL Complaints?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete all complaint records from database?</p>
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
              const toastId = toast.loading("Deleting all complaints...");
              try {
                await axiosInstance.delete("/complaint/clear-all");
                toast.success("All complaints deleted successfully!", { id: toastId });
                setComplaints([]);
                setSelectedIds([]);
                setDrawerOpen(false);
              } catch (err) {
                console.error("Error clearing complaints:", err);
                toast.error("Failed to delete all complaints.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Yes, Delete All
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Room Issues & Complaints</h1>
            <p className="text-slate-500 text-sm mt-1">
              Review tenant maintenance complaints. Select individual or all complaints to manage.
            </p>
          </div>

          {complaints.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <FiTrash2 className="text-sm" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition border border-rose-200"
              >
                Delete All Complaints
              </button>
            </div>
          )}
        </div>

        {/* Filter & Search Toolbar */}
        {complaints.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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
                  <span>Filter Issues</span>
                  {filterStatus !== "all" && (
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                  )}
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu with Checkboxes */}
              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Filter Options</div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={filterStatus === "all"}
                        onChange={() => setFilterStatus("all")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>All Issues</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={filterStatus === "pending"}
                        onChange={() => setFilterStatus(filterStatus === "pending" ? "all" : "pending")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Pending Only</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={filterStatus === "accepted"}
                        onChange={() => setFilterStatus(filterStatus === "accepted" ? "all" : "accepted")}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Accepted Only</span>
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={filterStatus === "resolved"}
                        onChange={() => setFilterStatus(filterStatus === "resolved" ? "all" : "resolved")}
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

        {/* Classic Clean Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredComplaints.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <h3 className="text-base font-bold text-slate-700">No Complaints Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no active room issues matching your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Issue Title & Category</th>
                    <th className="p-3.5">Room No</th>
                    <th className="p-3.5">Raised By</th>
                    <th className="p-3.5">Date Logged</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => {
                    const user = c.userDetail?.[0];
                    const room = c.roomDetail?.[0];
                    const isChecked = selectedIds.includes(c._id);

                    return (
                      <tr
                        key={c._id}
                        onClick={() => handleOpenComplaintDrawer(c)}
                        className={`hover:bg-slate-50 transition cursor-pointer group ${
                          isChecked ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 pl-5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleSelect(c._id, e as any)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Title & Category */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                            {c.title}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            {c.category}
                          </span>
                        </td>

                        {/* Room No */}
                        <td className="p-3.5 font-semibold text-slate-700">
                          {room ? `Room ${room.room_no}` : "N/A"}
                        </td>

                        {/* Raised By */}
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{user?.name || "Tenant"}</div>
                          {user?.email && <div className="text-xs text-slate-400">{user.email}</div>}
                        </td>

                        {/* Date Logged */}
                        <td className="p-3.5 text-slate-600 font-medium">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>

                        {/* Status */}
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

                        {/* Action */}
                        <td className="p-3.5 text-right pr-5 space-x-2">
                          <button
                            onClick={(e) => handleDeleteSingle(c._id, c.title, e)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                          >
                            Delete
                          </button>
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1">
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
        title={selectedComplaint ? `Issue: ${selectedComplaint.title}` : "Complaint Details"}
        subtitle="Review full issue note and update status."
      >
        {selectedComplaint && (() => {
          const isAccepted = selectedComplaint.status === "Accepted";
          const isResolved = selectedComplaint.status === "Resolved";
          const canResolve = selectedComplaint.user_reviewed === true || isResolved;

          return (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-blue-600 uppercase">{selectedComplaint.category}</span>
                <h3 className="text-xl font-black text-slate-800 mt-1">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-500 mt-2">
                  Raised by <span className="font-bold text-slate-700">{selectedComplaint.userDetail?.[0]?.name || "Tenant"}</span>
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Description Note</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-800 text-sm block">Resolution Note (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add note for the tenant..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus("Accepted")}
                    disabled={updating || isAccepted || isResolved}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-sm shadow transition"
                  >
                    {isAccepted ? "Issue Accepted" : "Accept Issue"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("Resolved")}
                    disabled={updating || !canResolve || isResolved}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-sm shadow transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isResolved ? "Resolved" : "Mark Resolved"}
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteSingle(selectedComplaint._id, selectedComplaint.title)}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl text-sm transition"
                >
                  Delete Complaint Record
                </button>

                {isAccepted && !selectedComplaint.user_reviewed && (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium leading-snug">
                    Waiting for the tenant to review & acknowledge your accepted response before you can click Mark Resolved.
                  </div>
                )}

                {selectedComplaint.user_reviewed && isAccepted && (
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium leading-snug">
                    Tenant has reviewed & acknowledged your response! You can now click Mark Resolved.
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </SlideOverDrawer>
    </div>
  );
};

export default OwnerComplaints;
