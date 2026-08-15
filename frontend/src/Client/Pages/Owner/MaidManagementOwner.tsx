import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgsByRegisterId } from "../../../Shared/Store/PgAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface PgItem {
  _id: string;
  name: string;
}

interface MaidItem {
  _id: string;
  name: string;
  mobile_number: string;
  duty_type: string;
  salary: number;
  status: string;
  pgDetail: { _id?: string; name: string }[];
}

const MaidManagementOwner: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState("");
  const [pgs, setPgs] = useState<PgItem[]>([]);
  const [maids, setMaids] = useState<MaidItem[]>([]);

  // Add Maid Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPgId, setSelectedPgId] = useState("");
  const [dutyType, setDutyType] = useState("Cleaning & Housekeeping");
  const [salary, setSalary] = useState(6000);

  // Assign Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskMaidId, setTaskMaidId] = useState("");
  const [taskPgId, setTaskPgId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          setOwnerId(user._id);
          const pgList = await fetchPgsByRegisterId(user._id);
          setPgs(pgList || []);
          if (pgList && pgList.length > 0) {
            setSelectedPgId(pgList[0]._id);
          }
          loadMaids(user._id);
        }
      } catch (err) {
        console.error("Error loading owner staff data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOwnerData();
  }, []);

  const loadMaids = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/maid/owner/${id}`);
      setMaids(res.data);
    } catch (err) {
      console.error("Error loading maids:", err);
    }
  };

  const handleAddMaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId || !selectedPgId || !name || !email || !password) return;

    try {
      await axiosInstance.post("/maid/add", {
        name,
        mobile_number: mobileNumber,
        email,
        password,
        owner_id: ownerId,
        pg_id: selectedPgId,
        duty_type: dutyType,
        salary: Number(salary),
      });

      alert("Maid account created successfully!");
      setShowAddModal(false);
      setName("");
      setMobileNumber("");
      setEmail("");
      setPassword("");
      loadMaids(ownerId);
    } catch (err: unknown) {
      console.error("Error adding maid:", err);
      alert("Failed to create maid account.");
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskMaidId || !taskTitle) return;

    try {
      await axiosInstance.post("/maid/task/assign", {
        maid_id: taskMaidId,
        pg_id: taskPgId,
        task_title: taskTitle,
        description: taskDescription,
      });

      alert("Task assigned successfully!");
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDescription("");
    } catch (err) {
      console.error("Error assigning task:", err);
    }
  };

  const handleMarkAttendance = async (maidId: string, status: string) => {
    try {
      await axiosInstance.post("/maid/attendance", {
        maid_id: maidId,
        status,
        date: new Date(),
      });
      alert(`Marked ${status} for today!`);
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  const handlePaySalary = async (maidId: string, amount: number) => {
    const month = new Date().toISOString().slice(0, 7);
    if (!confirm(`Confirm payout of ₹${amount} for month ${month}?`)) return;

    try {
      await axiosInstance.post("/maid/salary/pay", {
        maid_id: maidId,
        month,
        amount,
        payment_method: "Bank Transfer",
      });
      alert("Salary payout logged successfully!");
    } catch (err) {
      console.error("Error logging salary payment:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Staff & Maid Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Add maid accounts, set monthly salaries, track attendance, assign duties, and log monthly payouts.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow transition"
          >
            + Add Staff / Maid
          </button>
        </div>

        {maids.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mt-3">No Staff Employed Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Click "+ Add Staff / Maid" to create a maid account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maids.map((maid) => (
              <div key={maid._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full">
                        {maid.duty_type}
                      </span>
                      <h3 className="text-xl font-black text-slate-800 mt-2">{maid.name}</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      {maid.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned PG:</span>
                      <span className="font-semibold text-slate-700">{maid.pgDetail?.[0]?.name || "PG"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="font-semibold text-slate-700">{maid.mobile_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Salary:</span>
                      <span className="font-bold text-emerald-600">₹{maid.salary.toLocaleString()} / mo</span>
                    </div>
                  </div>

                  {/* Attendance buttons */}
                  <div className="bg-slate-50 p-3 rounded-xl mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Today's Attendance:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkAttendance(maid._id, "Present")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(maid._id, "Absent")}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg"
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
                  <button
                    onClick={() => {
                      setTaskMaidId(maid._id);
                      setTaskPgId(maid.pgDetail?.[0]?._id || "");
                      setShowTaskModal(true);
                    }}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    + Assign Duty
                  </button>
                  <button
                    onClick={() => handlePaySalary(maid._id, maid.salary)}
                    className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Pay Salary
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Maid Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Staff / Maid Account</h3>
            <form onSubmit={handleAddMaid} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Login Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Assign PG</label>
                <select
                  value={selectedPgId}
                  onChange={(e) => setSelectedPgId(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                >
                  {pgs.map((pg) => (
                    <option key={pg._id} value={pg._id}>
                      {pg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Duty Type</label>
                <select
                  value={dutyType}
                  onChange={(e) => setDutyType(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                >
                  <option value="Cleaning & Housekeeping">Cleaning & Housekeeping</option>
                  <option value="Cooking & Mess Operations">Cooking & Mess Operations</option>
                  <option value="Laundry & Maintenance">Laundry & Maintenance</option>
                  <option value="Security & Gate Duty">Security & Gate Duty</option>
                </select>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Assign Task / Duty</h3>
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean 2nd Floor Corridors & Rooms"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Instructions / Details</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaidManagementOwner;
