import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgsByRegisterId } from "../../../Shared/Store/PgAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface PgItem {
  _id: string;
  name: string;
}

interface MessPlanItem {
  _id: string;
  title: string;
  price: number;
  meals_included: string[];
  timings?: string;
  description?: string;
}

interface EnrollmentItem {
  _id: string;
  start_date: string;
  end_date: string;
  payment_status: string;
  status: string;
  userDetail: { name: string; email: string }[];
  planDetail: { title: string; price: number }[];
}

const MessManagementOwner: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pgs, setPgs] = useState<PgItem[]>([]);
  const [selectedPgId, setSelectedPgId] = useState<string>("");
  const [messPlans, setMessPlans] = useState<MessPlanItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

  // Add Plan Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("Standard Mess Plan");
  const [price, setPrice] = useState(3000);
  const [meals, setMeals] = useState("Breakfast, Lunch, Dinner");
  const [timings, setTimings] = useState("8:00 AM - 10:00 PM");
  const [description, setDescription] = useState("Daily 3 full hygienic meals.");

  useEffect(() => {
    const loadPgs = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const pgList = await fetchPgsByRegisterId(user._id);
          setPgs(pgList || []);
          if (pgList && pgList.length > 0) {
            setSelectedPgId(pgList[0]._id);
          }
        }
      } catch (err) {
        console.error("Error loading PGs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgs();
  }, []);

  useEffect(() => {
    if (selectedPgId) {
      loadMessPlans(selectedPgId);
      loadEnrollments(selectedPgId);
    }
  }, [selectedPgId]);

  const loadMessPlans = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/mess/plan/pg/${pgId}`);
      setMessPlans(res.data);
    } catch (err) {
      console.error("Error loading mess plans:", err);
    }
  };

  const loadEnrollments = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/mess/enrollments/pg/${pgId}`);
      setEnrollments(res.data);
    } catch (err) {
      console.error("Error loading enrollments:", err);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPgId || !title || !price) return;
    try {
      const mealsArr = meals.split(",").map((s) => s.trim()).filter(Boolean);
      await axiosInstance.post("/mess/plan/add", {
        pg_id: selectedPgId,
        title,
        price: Number(price),
        meals_included: mealsArr,
        timings,
        description,
      });
      setShowAddModal(false);
      loadMessPlans(selectedPgId);
    } catch (err) {
      console.error("Error adding mess plan:", err);
      alert("Failed to create mess plan");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Delete this mess plan?")) return;
    try {
      await axiosInstance.delete(`/mess/plan/${id}`);
      loadMessPlans(selectedPgId);
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Mess Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create meal packages, set monthly pricing, and view enrolled tenants.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pgs.length > 0 && (
              <select
                value={selectedPgId}
                onChange={(e) => setSelectedPgId(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl font-medium text-sm focus:outline-none shadow-sm"
              >
                {pgs.map((pg) => (
                  <option key={pg._id} value={pg._id}>
                    {pg.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow transition"
            >
              + Create Mess Plan
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Active Mess Plans</h2>
          {messPlans.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No mess plans configured yet. Click "+ Create Mess Plan" to define food options.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {messPlans.map((plan) => (
                <div key={plan._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                      Monthly Package
                    </span>
                    <h3 className="text-xl font-black text-slate-800 mt-2">{plan.title}</h3>
                    <p className="text-2xl font-black text-emerald-600 mt-2">₹{plan.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span></p>
                    <p className="text-xs text-slate-500 mt-2">{plan.description}</p>

                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Meals Included:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.meals_included.map((m, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                    >
                      Delete Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Tenants Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Enrolled Tenants</h3>
          </div>
          {enrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active mess enrollments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Mess Plan</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((e) => {
                    const u = e.userDetail?.[0];
                    const p = e.planDetail?.[0];
                    return (
                      <tr key={e._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-800">{u?.name || "Tenant"}</td>
                        <td className="p-4 font-bold text-blue-600">{p?.title || "Mess Plan"}</td>
                        <td className="p-4 text-slate-600">{new Date(e.start_date).toLocaleDateString()}</td>
                        <td className="p-4 text-slate-600">{new Date(e.end_date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs uppercase">
                            {e.status}
                          </span>
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

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create Mess Plan</h3>
            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Plan Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Monthly Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Meals Included (Comma separated)</label>
                <input
                  type="text"
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Meal Timings</label>
                <input
                  type="text"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessManagementOwner;
