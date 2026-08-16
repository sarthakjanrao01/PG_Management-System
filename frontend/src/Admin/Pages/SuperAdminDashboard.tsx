import React, { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../Shared/Lib/axios";
import Loading from "../../Shared/Components/Loading";
import SlideOverDrawer from "../../Shared/Components/SlideOverDrawer";
import { FiSearch } from "react-icons/fi";

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

  // Expandable Filter Dropdown state & ref
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Slide Over Drawer state
  const [drawerUser, setDrawerUser] = useState<UserItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Confirmation Modal state
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [confirmationInput, setConfirmationInput] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    loadAllUsers();
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

  const handleToggleApproval = async (ownerId: string, currentStatus: boolean, ownerName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      if (drawerUser && drawerUser._id === ownerId) {
        setDrawerUser((prev) => prev ? { ...prev, isApproved: nextStatus } : null);
      }
    } catch (err) {
      console.error("Error updating approval:", err);
      toast.error("Failed to update owner approval status.", { id: toastId });
    }
  };

  const handleOpenDeleteModal = (user: UserItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user account.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  // Roles count
  const ownerAccounts = useMemo(() => allUsers.filter((u) => ["owner", "pgowner"].includes((u.role || "").toLowerCase())), [allUsers]);
  const tenantAccounts = useMemo(() => allUsers.filter((u) => (u.role || "").toLowerCase() === "user"), [allUsers]);
  const maidAccounts = useMemo(() => allUsers.filter((u) => (u.role || "").toLowerCase() === "maid"), [allUsers]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const roleLower = (user.role || "").toLowerCase();
      const isOwnerRole = ["owner", "pgowner"].includes(roleLower);

      if (activeRoleFilter === "owner" && !isOwnerRole) return false;
      if (activeRoleFilter === "user" && roleLower !== "user") return false;
      if (activeRoleFilter === "maid" && roleLower !== "maid") return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        String(user.mobile_number).includes(q)
      );
    });
  }, [allUsers, activeRoleFilter, searchQuery]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Global account management and PG owner approvals.
          </p>
        </div>

        {/* Analytic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Registered Accounts</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{allUsers.length}</h3>
            <p className="text-xs text-slate-500 mt-1">All Roles Combined</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold uppercase text-purple-600">PG Owners</span>
            <h3 className="text-3xl font-black text-purple-600 mt-1">{ownerAccounts.length}</h3>
            <p className="text-xs text-amber-600 font-bold mt-1">
              {ownerAccounts.filter((o) => !o.isApproved).length} Pending Approval
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold uppercase text-blue-600">Tenants / Users</span>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{tenantAccounts.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Registered Tenant Users</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold uppercase text-emerald-600">Housekeeping Maids</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{maidAccounts.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Service Personnel</p>
          </div>
        </div>

        {/* Toolbar & Search & Expandable Checkbox Filter */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, mobile..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
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
                <span>Filter Accounts</span>
                {activeRoleFilter !== "all" && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                )}
              </div>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu with Checkboxes */}
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Filter Roles</div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={activeRoleFilter === "all"}
                      onChange={() => setActiveRoleFilter("all")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>All Accounts ({allUsers.length})</span>
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={activeRoleFilter === "owner"}
                      onChange={() => setActiveRoleFilter(activeRoleFilter === "owner" ? "all" : "owner")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>PG Owners ({ownerAccounts.length})</span>
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={activeRoleFilter === "user"}
                      onChange={() => setActiveRoleFilter(activeRoleFilter === "user" ? "all" : "user")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Tenants ({tenantAccounts.length})</span>
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={activeRoleFilter === "maid"}
                      onChange={() => setActiveRoleFilter(activeRoleFilter === "maid" ? "all" : "maid")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Maids ({maidAccounts.length})</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Classic Clean Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <h3 className="text-base font-bold text-slate-700">No Accounts Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no system accounts matching your current search filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">User Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Contact Info</th>
                    <th className="p-3.5">Status / Approval</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const roleLower = (user.role || "").toLowerCase();
                    const isOwnerRole = ["owner", "pgowner"].includes(roleLower);

                    return (
                      <tr
                        key={user._id}
                        onClick={() => {
                          setDrawerUser(user);
                          setDrawerOpen(true);
                        }}
                        className="hover:bg-slate-50 transition cursor-pointer group"
                      >
                        {/* User Details */}
                        <td className="p-3.5 pl-5">
                          <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span
                            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded uppercase ${
                              isOwnerRole
                                ? "bg-purple-50 text-purple-700"
                                : roleLower === "maid"
                                ? "bg-emerald-50 text-emerald-700"
                                : roleLower === "superadmin"
                                ? "bg-amber-50 text-amber-700 font-bold"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Contact Info */}
                        <td className="p-3.5 text-slate-600 font-medium text-xs">
                          <div className="text-slate-700 font-semibold">{user.email}</div>
                          <div className="text-slate-400">{user.mobile_number}</div>
                        </td>

                        {/* Status / Approval */}
                        <td className="p-3.5">
                          {isOwnerRole ? (
                            user.isApproved ? (
                              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 uppercase animate-pulse">
                                Pending Approval
                              </span>
                            )
                          ) : (
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {isOwnerRole && (
                              <button
                                onClick={(e) => handleToggleApproval(user._id, !!user.isApproved, user.name, e)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                  user.isApproved
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                }`}
                              >
                                {user.isApproved ? "Revoke" : "Approve"}
                              </button>
                            )}

                            {roleLower !== "superadmin" && (
                              <button
                                onClick={(e) => handleOpenDeleteModal(user, e)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
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

      {/* Slide-Over Drawer for Account Details */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerUser ? drawerUser.name : "Account Details"}
        subtitle="Review full account profile & permissions."
      >
        {drawerUser && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">{drawerUser.role}</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{drawerUser.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Account ID: <span className="font-mono">{drawerUser._id}</span>
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Contact & Profile Info</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Email Address</span>
                  <a href={`mailto:${drawerUser.email}`} className="font-semibold text-blue-600 hover:underline">
                    {drawerUser.email}
                  </a>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Mobile Number</span>
                  <a href={`tel:${drawerUser.mobile_number}`} className="font-semibold text-blue-600 hover:underline">
                    {drawerUser.mobile_number}
                  </a>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Joined Date</span>
                  <span className="font-semibold text-slate-700">{new Date(drawerUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {["owner", "pgowner"].includes((drawerUser.role || "").toLowerCase()) && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Approval Status</h4>
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {drawerUser.isApproved ? "Account Approved" : "Pending Approval"}
                  </span>
                  <button
                    onClick={() => {
                      handleToggleApproval(drawerUser._id, !!drawerUser.isApproved, drawerUser.name);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      drawerUser.isApproved
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    }`}
                  >
                    {drawerUser.isApproved ? "Revoke Approval" : "Approve Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>

      {/* Typed Confirmation Modal for Deleting User & Cascade Data */}
      {targetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
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
