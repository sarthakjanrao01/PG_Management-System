import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../Shared/Lib/axios";
import Loading from "../../Shared/Components/Loading";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  mobile_number: number;
  role: string;
  isApproved?: boolean;
  createdAt: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Confirmation Modal state
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [confirmationInput, setConfirmationInput] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const res = await axiosInstance.get("/register/getall");
      setAllUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching all users for superadmin:", err);
      toast.error("Failed to load system accounts.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (ownerId: string, currentStatus: boolean, ownerName: string) => {
    const nextStatus = !currentStatus;
    const actionText = nextStatus ? "Approving owner..." : "Revoking approval...";
    const toastId = toast.loading(actionText);

    try {
      await axiosInstance.put(`/register/approve/${ownerId}`, {
        isApproved: nextStatus,
      });

      if (nextStatus) {
        toast.success(`Owner ${ownerName} approved! They can now log in.`, { id: toastId });
      } else {
        toast.success(`Approval for ${ownerName} revoked.`, { id: toastId });
      }

      setAllUsers((prev) =>
        prev.map((u) => (u._id === ownerId ? { ...u, isApproved: nextStatus } : u))
      );
    } catch (err) {
      console.error("Error updating approval:", err);
      toast.error("Failed to update owner approval status.", { id: toastId });
    }
  };

  const handleOpenDeleteModal = (user: UserItem) => {
    setTargetUser(user);
    setConfirmationInput("");
  };

  const handleConfirmDelete = async () => {
    if (!targetUser) return;
    const requiredCode = `DELETE ${targetUser.name}`;
    if (confirmationInput !== requiredCode) {
      toast.error(`Confirmation text must match: "${requiredCode}"`);
      return;
    }

    setDeleting(true);
    const toastId = toast.loading(`Deleting ${targetUser.name} & all associated data...`);

    try {
      await axiosInstance.delete(`/register/delete/${targetUser._id}`);
      toast.success(`Account ${targetUser.name} & all related data deleted cleanly!`, { id: toastId });
      setAllUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      setTargetUser(null);
      setConfirmationInput("");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user account.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;

  // Counts
  const ownerAccounts = allUsers.filter((u) => ["owner", "pgowner"].includes((u.role || "").toLowerCase()));
  const tenantAccounts = allUsers.filter((u) => ["user", "tenant"].includes((u.role || "").toLowerCase()));
  const maidAccounts = allUsers.filter((u) => (u.role || "").toLowerCase() === "maid");
  const pendingOwnersCount = ownerAccounts.filter((o) => !o.isApproved).length;

  // Filtered List
  const filteredUsers = allUsers.filter((user) => {
    const roleLower = (user.role || "").toLowerCase();
    let matchesRole = true;
    if (activeRoleFilter === "owner") {
      matchesRole = ["owner", "pgowner"].includes(roleLower);
    } else if (activeRoleFilter === "user") {
      matchesRole = ["user", "tenant"].includes(roleLower);
    } else if (activeRoleFilter === "maid") {
      matchesRole = roleLower === "maid";
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      String(user.mobile_number).includes(q);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Superadmin Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-2">
              System Account Control
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1">
              Logged in as <span className="font-bold underline">admin@gmail.com</span>. View, manage, approve, or permanently delete any account and all related database records.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-400">Total Accounts</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{allUsers.length}</h3>
            <p className="text-xs text-slate-500 mt-1">All Roles Combined</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase text-purple-600">PG Owners</span>
            <h3 className="text-3xl font-black text-purple-600 mt-1">{ownerAccounts.length}</h3>
            <p className="text-xs text-amber-600 font-bold mt-1">{pendingOwnersCount} Pending Approval</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase text-blue-600">Tenants / Users</span>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{tenantAccounts.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Registered Tenant Users</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase text-emerald-600">Housekeeping Maids</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{maidAccounts.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Service Personnel</p>
          </div>
        </div>

        {/* Account Management Table Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveRoleFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRoleFilter === "all"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Accounts ({allUsers.length})
              </button>
              <button
                onClick={() => setActiveRoleFilter("owner")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRoleFilter === "owner"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Owners ({ownerAccounts.length})
              </button>
              <button
                onClick={() => setActiveRoleFilter("user")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRoleFilter === "user"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Tenants ({tenantAccounts.length})
              </button>
              <button
                onClick={() => setActiveRoleFilter("maid")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeRoleFilter === "maid"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Maids ({maidAccounts.length})
              </button>
            </div>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 border border-slate-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No accounts found matching filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Status / Approval</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const roleLower = (user.role || "").toLowerCase();
                    const isOwnerRole = ["owner", "pgowner"].includes(roleLower);

                    return (
                      <tr key={user._id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4">
                          <div className="font-black text-slate-800">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                              isOwnerRole
                                ? "bg-purple-100 text-purple-800"
                                : roleLower === "maid"
                                ? "bg-emerald-100 text-emerald-800"
                                : roleLower === "superadmin"
                                ? "bg-amber-100 text-amber-900 font-black"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-xs space-y-0.5">
                          <div className="font-semibold text-slate-700">📧 {user.email}</div>
                          <div>📞 {user.mobile_number}</div>
                        </td>
                        <td className="p-4">
                          {isOwnerRole ? (
                            user.isApproved ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                                Approved
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full uppercase animate-pulse">
                                Pending Approval
                              </span>
                            )
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwnerRole && (
                              <button
                                onClick={() => handleToggleApproval(user._id, !!user.isApproved, user.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                  user.isApproved
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                }`}
                              >
                                {user.isApproved ? "Revoke" : "Approve"}
                              </button>
                            )}

                            {roleLower !== "superadmin" && (
                              <button
                                onClick={() => handleOpenDeleteModal(user)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3.5 py-1.5 rounded-xl text-xs transition border border-rose-200 shadow-xs"
                              >
                                Delete
                              </button>
                            )}
                          </div>
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

      {/* Typed Confirmation Modal for Deleting User & Cascade Data */}
      {targetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-black text-slate-800">Confirm User Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete <b>{targetUser.name}</b> ({targetUser.role}) and <b>ALL related database records</b> (tenancies, payment history, complaints, bookings, and notifications).
            </p>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <p className="text-xs font-bold text-rose-800">To confirm deletion, please type exact code:</p>
              <code className="block mt-1 font-mono font-black text-sm text-rose-900 select-all bg-white px-2.5 py-1 rounded border border-rose-300 w-fit">
                DELETE {targetUser.name}
              </code>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Type Confirmation Text
              </label>
              <input
                type="text"
                autoFocus
                placeholder={`Type DELETE ${targetUser.name}`}
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTargetUser(null);
                  setConfirmationInput("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmationInput !== `DELETE ${targetUser.name}` || deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Confirm & Delete All Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
