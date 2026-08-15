import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface MaidDetails {
  _id: string;
  name: string;
  duty_type: string;
  salary: number;
  pgDetail: { name: string; address: string }[];
}

interface TaskItem {
  _id: string;
  task_title: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface SalaryItem {
  _id: string;
  month: string;
  amount: number;
  paid_date: string;
  status: string;
}

const MaidDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [maid, setMaid] = useState<MaidDetails | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [salaries, setSalaries] = useState<SalaryItem[]>([]);

  useEffect(() => {
    const fetchMaidData = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const maidRes = await axiosInstance.get(`/maid/user/${user._id}`).catch(() => ({ data: null }));
          const m = maidRes.data;
          setMaid(m);

          if (m && m._id) {
            const [taskRes, salRes] = await Promise.all([
              axiosInstance.get(`/maid/task/maid/${m._id}`).catch(() => ({ data: [] })),
              axiosInstance.get(`/maid/salary/maid/${m._id}`).catch(() => ({ data: [] })),
            ]);
            setTasks(taskRes.data || []);
            setSalaries(salRes.data || []);
          }
        }
      } catch (err) {
        console.error("Error loading maid dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaidData();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await axiosInstance.put(`/maid/task/${taskId}`, {
        status: "Completed",
        completion_note: "Task finished",
      });
      if (maid) {
        const res = await axiosInstance.get(`/maid/task/maid/${maid._id}`);
        setTasks(res.data);
      }
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  if (loading) return <Loading />;

  const pendingTasks = tasks.filter((t) => t.status === "Pending");
  const latestSalary = salaries[0];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Staff Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold mt-2">
              Welcome, {maid?.name || "Staff Member"}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base mt-1">
              {maid?.duty_type} • Assigned to {maid?.pgDetail?.[0]?.name || "PG Property"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/maid/tasks")}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow"
            >
              My Task List ({pendingTasks.length})
            </button>
            <button
              onClick={() => navigate("/maid/salary")}
              className="bg-indigo-900/40 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
            >
              Salary Slips
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Salary</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">
              ₹{(maid?.salary || 0).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Latest Payout: {latestSalary ? new Date(latestSalary.paid_date).toLocaleDateString() : "Pending"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Tasks</p>
            <h3 className="text-3xl font-black text-indigo-600 mt-1">{tasks.length}</h3>
            <p className="text-xs text-slate-500 mt-2">{pendingTasks.length} Pending Tasks</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employment Status</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">Active Staff</h3>
            <p className="text-xs text-slate-500 mt-2">Duty: {maid?.duty_type || "Staff"}</p>
          </div>
        </div>

        {/* Tasks Checklist */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Assigned Tasks & Duties</h2>
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No tasks assigned to you right now.</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition flex items-center justify-between gap-4 bg-slate-50/50"
                >
                  <div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        t.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base mt-1">{t.task_title}</h4>
                    {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                  </div>

                  {t.status !== "Completed" && (
                    <button
                      onClick={() => handleCompleteTask(t._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaidDashboard;
