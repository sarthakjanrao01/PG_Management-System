import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface TaskItem {
  _id: string;
  task_title: string;
  description?: string;
  status: string;
  createdAt: string;
}

const MaidTasks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [maidId, setMaidId] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const maidRes = await axiosInstance.get(`/maid/user/${user._id}`).catch(() => ({ data: null }));
          if (maidRes.data && maidRes.data._id) {
            setMaidId(maidRes.data._id);
            const taskRes = await axiosInstance.get(`/maid/task/maid/${maidRes.data._id}`);
            setTasks(taskRes.data);
          }
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await axiosInstance.put(`/maid/task/${id}`, {
        status: "Completed",
        completion_note: "Task completed by staff",
      });
      const res = await axiosInstance.get(`/maid/task/maid/${maidId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error marking complete:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">My Duty Checklist</h1>
        <p className="text-slate-500 text-sm mb-8">View daily and weekly cleaning, cooking, and maintenance tasks assigned to you.</p>

        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mt-3">All Clear!</h3>
            <p className="text-sm text-slate-500 mt-1">No pending tasks assigned right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => (
              <div key={t._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      t.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {t.status}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">{t.task_title}</h3>
                  {t.description && <p className="text-slate-500 text-sm mt-1">{t.description}</p>}
                </div>

                {t.status !== "Completed" && (
                  <button
                    onClick={() => handleComplete(t._id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaidTasks;
