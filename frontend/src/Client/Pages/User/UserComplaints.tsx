import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface ComplaintItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  user_reviewed?: boolean;
  resolution_note?: string;
  createdAt: string;
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
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [tenancy, setTenancy] = useState<TenancyDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState("Maintenance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadUserComplaints();
  }, []);

  const loadUserComplaints = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user._id);
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
    } catch (err) {
      console.error("Error loading user complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please provide a title and detailed description.");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Submitting complaint...");

    try {
      await axiosInstance.post("/complaint/add", {
        user_id: userId,
        pg_id: tenancy?.pg_id,
        room_id: tenancy?.room_id || tenancy?.roomDetail?.[0]?._id,
        category,
        title,
        description,
      });

      toast.success("Complaint submitted successfully! PG Owner has been notified via notification bell.", { id: toastId });
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

  const handleReviewComplaint = async (complaintId: string) => {
    const toastId = toast.loading("Acknowledging owner response...");
    try {
      await axiosInstance.put(`/complaint/review/${complaintId}`);
      toast.success("Response acknowledged! Owner has been notified and can now mark this issue as resolved.", { id: toastId });
      loadUserComplaints();
    } catch (err) {
      console.error("Error reviewing complaint:", err);
      toast.error("Failed to confirm review.", { id: toastId });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Complaints & Maintenance Notes</h1>
          <p className="text-slate-500 text-sm mt-1">
            Raise issues directly to the PG owner. Updates will be visible in real-time.
          </p>
        </div>

        {/* Create Complaint Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Raise New Maintenance Complaint</h3>
          <form onSubmit={handleCreateComplaint} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-600">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Maintenance">Maintenance & Plumbing</option>
                  <option value="Cleanliness">Cleanliness & Hygiene</option>
                  <option value="Electricity">Electricity & Appliance</option>
                  <option value="Noise">Noise & Disturbance</option>
                  <option value="Security">Security & Access</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-600">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tap leaking in bathroom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-600">Detailed Description Note</label>
              <textarea
                rows={3}
                required
                placeholder="Provide complete details about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
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

        {/* Complaints History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Your Logged Complaints</h3>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No complaints logged yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c._id} className="p-6 space-y-3 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase">{c.category}</span>
                      <h4 className="text-base font-bold text-slate-800 mt-0.5">{c.title}</h4>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase w-fit ${
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

                  <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {c.description}
                  </p>

                  {c.resolution_note && (
                    <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900">
                      <span className="font-bold block">Owner Note:</span>
                      {c.resolution_note}
                    </div>
                  )}

                  {/* Owner Accepted - Tenant Review Required */}
                  {c.status === "Accepted" && !c.user_reviewed && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-800">Owner has accepted your complaint request!</span>
                        <p className="text-xs text-amber-700 mt-0.5">Please review & acknowledge so owner can mark it resolved.</p>
                      </div>
                      <button
                        onClick={() => handleReviewComplaint(c._id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition whitespace-nowrap"
                      >
                        Review & Acknowledge
                      </button>
                    </div>
                  )}

                  {c.user_reviewed && c.status === "Accepted" && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-medium">
                      ✓ You have reviewed this accepted issue. Owner has been notified to mark as Resolved.
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    Logged on {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserComplaints;
