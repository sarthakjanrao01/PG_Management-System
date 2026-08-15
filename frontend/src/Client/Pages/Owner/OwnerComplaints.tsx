import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";

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

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadComplaints();
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

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === complaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(complaints.map((c) => c._id));
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

  const handleDeleteSingle = (id: string, title: string) => {
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Room Issues & Complaints</h1>
            <p className="text-slate-500 text-sm mt-1">
              Review tenant maintenance complaints. Select individual or all complaints to delete.
            </p>
          </div>

          {complaints.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
                >
                  Delete Selected ({selectedIds.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition border border-rose-200 shadow-xs"
              >
                Delete All Complaints
              </button>
            </div>
          )}
        </div>

        {complaints.length > 0 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={selectedIds.length === complaints.length && complaints.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Select All ({complaints.length} Issues)
            </label>
            <span className="text-xs text-slate-400">
              {selectedIds.length} item(s) selected
            </span>
          </div>
        )}

        {complaints.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700">No Complaints Logged</h3>
            <p className="text-sm text-slate-500 mt-1">There are currently no active room issues or maintenance notes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => {
              const user = c.userDetail?.[0];
              const room = c.roomDetail?.[0];
              const isChecked = selectedIds.includes(c._id);

              return (
                <div
                  key={c._id}
                  onClick={() => handleOpenComplaintDrawer(c)}
                  className={`p-6 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 group ${
                    isChecked
                      ? "bg-blue-50/60 border-blue-400 ring-1 ring-blue-400/30"
                      : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => handleToggleSelect(c._id, e)}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold uppercase text-blue-600">{c.category}</span>
                        {room && <span className="text-xs font-bold text-slate-500">Room {room.room_no}</span>}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            c.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "Accepted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mt-1.5 group-hover:text-blue-600 transition">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Raised by {user?.name || "Tenant"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(c._id, c.title);
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-2 rounded-xl text-xs transition"
                    >
                      Delete
                    </button>
                    <button className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition">
                      Review & Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm"
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
