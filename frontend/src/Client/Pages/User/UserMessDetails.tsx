import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface MessPlan {
  _id: string;
  title: string;
  price: number;
  meals_included: string[];
  description?: string;
}

interface Enrollment {
  _id: string;
  start_date: string;
  end_date: string;
  status: string;
  planDetail: { title: string; price: number; meals_included: string[] }[];
}

const UserMessDetails: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [pgId, setPgId] = useState("");
  const [plans, setPlans] = useState<MessPlan[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    const fetchMessInfo = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          setUserId(user._id);
          const tenancyRes = await axiosInstance.get(`/tenancy/user/${user._id}`).catch(() => ({ data: null }));
          if (tenancyRes.data && tenancyRes.data.pg_id) {
            setPgId(tenancyRes.data.pg_id);
            const plansRes = await axiosInstance.get(`/mess/plan/pg/${tenancyRes.data.pg_id}`);
            setPlans(plansRes.data);
          }
          const messRes = await axiosInstance.get(`/mess/user/${user._id}`).catch(() => ({ data: null }));
          setEnrollment(messRes.data);
        }
      } catch (err) {
        console.error("Error loading mess info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessInfo();
  }, []);

  const handleEnroll = async (planId: string) => {
    if (!userId || !pgId) {
      alert("Please ensure your room allotment is active before subscribing to mess.");
      return;
    }
    try {
      await axiosInstance.post("/mess/enroll", {
        user_id: userId,
        pg_id: pgId,
        mess_plan_id: planId,
        duration_months: 1,
      });
      alert("Successfully enrolled in mess plan!");
      window.location.reload();
    } catch (err) {
      console.error("Error subscribing to mess:", err);
      alert("Subscription failed.");
    }
  };

  if (loading) return <Loading />;

  const activePlan = enrollment?.planDetail?.[0];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Mess & Meal Subscriptions</h1>
        <p className="text-slate-500 text-sm mb-8">View active meal plans, food timings, and subscribe to mess services.</p>

        {enrollment && activePlan && (
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm mb-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase">
                  Active Subscription
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">{activePlan.title}</h3>
                <p className="text-sm font-semibold text-emerald-600 mt-1">₹{activePlan.price} / month</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full uppercase">
                {enrollment.status}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div>Start Date: <strong className="text-slate-700">{new Date(enrollment.start_date).toLocaleDateString()}</strong></div>
              <div>End Date: <strong className="text-slate-700">{new Date(enrollment.end_date).toLocaleDateString()}</strong></div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-800 mb-4">Available Mess Packages</h2>
        {plans.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No mess plans available for your PG property at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">{plan.title}</h3>
                  <p className="text-2xl font-black text-blue-600 mt-2">₹{plan.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
                  <p className="text-xs text-slate-500 mt-2">{plan.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {plan.meals_included.map((m, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEnroll(plan._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    Subscribe to Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessDetails;
