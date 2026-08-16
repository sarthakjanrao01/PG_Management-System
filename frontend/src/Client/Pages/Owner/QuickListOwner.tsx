import React, { useEffect, useState, useMemo, useRef } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgsByRegisterId } from "../../../Shared/Store/PgAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiPhone,
  FiMessageSquare,
  FiCopy,
  FiCalendar,
  FiUser,
  FiHome,
  FiArrowRight,
  FiDollarSign,
} from "react-icons/fi";

interface PgItem {
  _id: string;
  name: string;
}

interface QuickListItem {
  _id: string;
  status: string;
  allotment_date: string;
  user: {
    _id: string;
    name: string;
    email: string;
    mobile_number: string | number;
  };
  room: {
    _id: string;
    room_no: string;
    type: string;
    floor: number;
    rent: number;
    capacity: number;
    occupied_count: number;
    amenities: string[];
  };
  payment: {
    total_paid: number;
    rent: number;
    status: "Paid" | "Partial" | "Pending";
    payment_count: number;
  };
  validity: {
    start_date: string;
    end_date: string;
  };
}

interface PaymentRecord {
  _id: string;
  user_id?: string;
  pg_id?: string;
  room_id?: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  createdAt: string;
}

const QuickListOwner: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<QuickListItem[]>([]);
  const [pgs, setPgs] = useState<PgItem[]>([]);
  const [selectedPgId, setSelectedPgId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [filterPaid, setFilterPaid] = useState<boolean>(false);
  const [filterPending, setFilterPending] = useState<boolean>(false);
  const [roomSortOrder, setRoomSortOrder] = useState<"asc" | "desc">("asc");

  // Expandable Filter Dropdown state & ref
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Right Drawer state & Transaction step logs
  const [selectedItem, setSelectedItem] = useState<QuickListItem | null>(null);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<string[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [paymentLogsCollapsed, setPaymentLogsCollapsed] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [vacating, setVacating] = useState<boolean>(false);

  const toggleExpandPayment = (id: string) => {
    if (expandedPaymentIds.includes(id)) {
      setExpandedPaymentIds(expandedPaymentIds.filter((pId) => pId !== id));
    } else {
      setExpandedPaymentIds([...expandedPaymentIds, id]);
    }
  };

  useEffect(() => {
    const loadPgsAndData = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const pgList = await fetchPgsByRegisterId(user._id);
          setPgs(pgList || []);
          await loadQuickListData(selectedPgId);
        }
      } catch (err) {
        console.error("Error loading PG data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgsAndData();
  }, []);

  const loadQuickListData = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/tenancy/quick-list/${pgId}`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching quick list:", err);
      toast.error("Failed to fetch tenant list.");
    }
  };

  const handlePgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPgId(val);
    loadQuickListData(val);
  };

  // Instant Search & Checkbox Filtering & Room Sorting logic
  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      const query = searchTerm.toLowerCase().trim();
      const nameMatch = (item.user?.name || "").toLowerCase().includes(query);
      const roomMatch = (item.room?.room_no || "").toLowerCase().includes(query);
      const mobileMatch = String(item.user?.mobile_number || "").includes(query);
      const matchesSearch = nameMatch || roomMatch || mobileMatch;

      if (!matchesSearch) return false;

      const anyFilterChecked = filterActive || filterPaid || filterPending;
      if (!anyFilterChecked) return true;

      const isActive = item.status === "Active";
      const isPaid = item.payment?.status === "Paid";
      const isPending = item.payment?.status === "Pending" || item.payment?.status === "Partial";

      if (filterActive && isActive) return true;
      if (filterPaid && isPaid) return true;
      if (filterPending && isPending) return true;

      return false;
    });

    return result.sort((a, b) => {
      const roomA = a.room?.room_no || "";
      const roomB = b.room?.room_no || "";
      const numA = parseInt(roomA.replace(/\D/g, "")) || 0;
      const numB = parseInt(roomB.replace(/\D/g, "")) || 0;

      if (numA !== numB) {
        return roomSortOrder === "asc" ? numA - numB : numB - numA;
      }
      return roomSortOrder === "asc"
        ? roomA.localeCompare(roomB, undefined, { numeric: true })
        : roomB.localeCompare(roomA, undefined, { numeric: true });
    });
  }, [items, searchTerm, filterActive, filterPaid, filterPending, roomSortOrder]);

  const handleOpenDrawer = async (item: QuickListItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setLoadingPayments(true);
    setPaymentLogsCollapsed(true);
    try {
      const res = await axiosInstance.get(`/pgpayment/user/${item.user._id}`);
      setUserPayments(res.data || []);
    } catch (err) {
      console.error("Error fetching user payments:", err);
      setUserPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleCopyMobile = (mobile: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(mobile));
    toast.success("Mobile number copied!");
  };

  const handleVacateTenant = () => {
    if (!selectedItem) return;
    const tenantName = selectedItem.user.name || "Occupant";
    const roomNo = selectedItem.room.room_no || "N/A";

    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1 font-sans">
          <p className="font-black text-rose-600 text-sm">Vacate Tenant {tenantName}?</p>
          <p className="text-xs text-slate-600">
            Are you sure you want to vacate {tenantName} from Room {roomNo}? This will mark their tenancy as vacated and free up the bed capacity.
          </p>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs bg-slate-100 font-semibold rounded-lg text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setVacating(true);
                const toastId = toast.loading(`Vacating ${tenantName}...`);
                try {
                  await axiosInstance.put(`/tenancy/vacate/${selectedItem._id}`);
                  toast.success(`Tenant ${tenantName} marked as vacated!`, { id: toastId });
                  setDrawerOpen(false);
                  loadQuickListData(selectedPgId);
                } catch (err) {
                  console.error("Error vacating tenant:", err);
                  toast.error("Failed to vacate tenant.", { id: toastId });
                } finally {
                  setVacating(false);
                }
              }}
              className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white hover:bg-rose-700 transition cursor-pointer"
            >
              Confirm Vacate
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Classic Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Quick Occupant Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Search occupants by Name, Room Number, or Mobile. Click any row for details.
            </p>
          </div>

          {/* PG Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pg-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Select PG:
            </label>
            <select
              id="pg-select"
              value={selectedPgId}
              onChange={handlePgChange}
              className="bg-white border border-slate-300 text-slate-800 font-medium px-3 py-2 rounded-lg text-sm focus:outline-none"
            >
              <option value="all">All PGs</option>
              {pgs.map((pg) => (
                <option key={pg._id} value={pg._id}>
                  {pg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search & Filter Toolbar - 100% Mobile Responsive */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Room, Mobile..."
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

          {/* Expandable Filter & Sort Button */}
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
                <span>Filter & Sort Options</span>
                {(filterActive || filterPaid || filterPending) && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">!</span>
                )}
              </div>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expandable Dropdown List with Checkboxes */}
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Filter Occupants</div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={filterActive}
                      onChange={(e) => setFilterActive(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Active Occupants</span>
                  </label>

                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={filterPaid}
                      onChange={(e) => setFilterPaid(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Payment Paid</span>
                  </label>

                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={filterPending}
                      onChange={(e) => setFilterPending(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Payment Pending</span>
                  </label>
                </div>

                <div className="my-2 border-t border-slate-100" />

                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Sort Room Number</div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={roomSortOrder === "asc"}
                      onChange={() => setRoomSortOrder("asc")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Room 1 → 9 (Ascending)</span>
                  </label>

                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={roomSortOrder === "desc"}
                      onChange={() => setRoomSortOrder("desc")}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Room 9 → 1 (Descending)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Classic Clean Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No occupants found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Name</th>
                    <th className="p-3.5">Room Number</th>
                    <th className="p-3.5">Payment Done</th>
                    <th className="p-3.5">Mobile Number</th>
                    <th className="p-3.5">Valid Date (1 Month)</th>
                    <th className="p-3.5 text-right pr-5">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const u = item.user;
                    const r = item.room;
                    const p = item.payment;
                    const v = item.validity;

                    return (
                      <tr
                        key={item._id}
                        onClick={() => handleOpenDrawer(item)}
                        className="hover:bg-slate-50 transition cursor-pointer group"
                      >
                        {/* 1. Name */}
                        <td className="p-3.5 pl-5 font-semibold text-slate-800">
                          <div>
                            <span>{u.name || "Occupant"}</span>
                            {u.email && (
                              <div className="text-xs font-normal text-slate-400">{u.email}</div>
                            )}
                          </div>
                        </td>

                        {/* 2. Room Number */}
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-700">Room {r.room_no}</span>
                          <span className="text-xs text-slate-400 block">{r.type}</span>
                        </td>

                        {/* 3. Payment Done */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            ₹{(p.total_paid || 0).toLocaleString()}
                          </div>
                          <span
                            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                              p.status === "Paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "Partial"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        {/* 4. Mobile Number */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${u.mobile_number}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-slate-700 hover:text-blue-600 transition"
                            >
                              {u.mobile_number || "N/A"}
                            </a>
                            {u.mobile_number && u.mobile_number !== "N/A" && (
                              <button
                                onClick={(e) => handleCopyMobile(u.mobile_number, e)}
                                title="Copy Mobile Number"
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <FiCopy className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 5. Valid Date (1 Month) */}
                        <td className="p-3.5 text-xs text-slate-600 font-medium">
                          <span>{formatDate(v.start_date)}</span>
                          <span className="mx-1 text-slate-400">to</span>
                          <span>{formatDate(v.end_date)}</span>
                        </td>

                        {/* 6. Action */}
                        <td className="p-3.5 text-right pr-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(item);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 ml-auto"
                          >
                            <span>Details</span>
                            <FiArrowRight className="text-xs" />
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

      {/* Rich Right Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem ? `Room ${selectedItem.room.room_no} Details` : "Room Details"}
        subtitle="Complete occupant & room information slider"
      >
        {selectedItem && (
          <div className="space-y-6 text-sm">
            {/* Occupant Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs font-black text-lg flex items-center justify-center shrink-0 border border-white/20`}
                >
                  {(selectedItem.user.name || "U").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedItem.user.name}</h3>
                  <p className="text-xs text-blue-100">{selectedItem.user.email || "No email registered"}</p>
                </div>
              </div>

              {/* Direct Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/20">
                <a
                  href={`tel:${selectedItem.user.mobile_number}`}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <FiPhone /> Call Now
                </a>
                <a
                  href={`https://wa.me/${String(selectedItem.user.mobile_number).replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <FiMessageSquare /> WhatsApp
                </a>
              </div>
            </div>

            {/* Room Specifications Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FiHome /> Room Info
                </span>
                <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-0.5 rounded-md">
                  Room {selectedItem.room.room_no}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Sharing Type:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedItem.room.type}</p>
                </div>
                <div>
                  <span className="text-slate-400">Floor Level:</span>
                  <p className="font-bold text-slate-800 mt-0.5">Floor {selectedItem.room.floor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Monthly Rent:</span>
                  <p className="font-extrabold text-blue-600 mt-0.5">₹{selectedItem.room.rent.toLocaleString()} / mo</p>
                </div>
                <div>
                  <span className="text-slate-400">Occupancy:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedItem.room.occupied_count} / {selectedItem.room.capacity} Beds
                  </p>
                </div>
              </div>

              {/* Amenities tags */}
              {selectedItem.room.amenities && selectedItem.room.amenities.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Amenities Included:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.room.amenities.map((am, i) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FiDollarSign /> Payment Summary
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                    selectedItem.payment.status === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedItem.payment.status === "Partial"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedItem.payment.status}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-400">Total Payment Done</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                    ₹{selectedItem.payment.total_paid.toLocaleString()}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Room Monthly Rent</span>
                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">
                    ₹{selectedItem.payment.rent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Step-by-Step Payment Transaction Logs Section Header */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div
                onClick={() => setPaymentLogsCollapsed(!paymentLogsCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none py-1 hover:text-blue-600 transition group"
              >
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 group-hover:text-blue-600 transition">
                  <span>Payment History Log ({userPayments.length} Steps)</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    Collapsible Log
                  </span>
                </h4>
                <svg
                  className={`w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform duration-200 ${
                    paymentLogsCollapsed ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {!paymentLogsCollapsed && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {loadingPayments ? (
                    <div className="text-xs text-slate-400 py-2">Loading transaction logs...</div>
                  ) : userPayments.length === 0 ? (
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                      ✓ Initial Allotment Payment Settled
                    </div>
                  ) : (
                    userPayments.map((p, index) => {
                      const isExpanded = expandedPaymentIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition"
                        >
                          {/* Clickable Header Row with Dropdown Arrow */}
                          <div
                            onClick={() => toggleExpandPayment(p._id)}
                            className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer flex items-center justify-between gap-2 select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                                Payment #{index + 1}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                Paid & Verified
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-xs">
                                ₹{p.amount?.toLocaleString() || selectedItem.room.rent.toLocaleString()}
                              </span>
                              <svg
                                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Expandable Details Body */}
                          {isExpanded && (
                            <div className="p-3.5 border-t border-slate-100 bg-white space-y-2 text-xs animate-in fade-in duration-150">
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Order ID:</span>
                                <span className="font-mono text-slate-800 font-semibold">{p.razorpay_order_id}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Payment ID:</span>
                                <span className="font-mono text-slate-800 font-semibold">{p.razorpay_payment_id}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Payment Date:</span>
                                <span className="font-medium text-slate-700">{new Date(p.createdAt || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Status:</span>
                                <span className="font-bold text-emerald-600">Verified Online Transfer</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Validity & Stay Period Card */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                <FiCalendar /> 1 Month Validity Period
              </span>
              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Start Date</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedItem.validity.start_date)}</span>
                </div>
                <div className="text-slate-400 font-mono">────►</div>
                <div className="text-right">
                  <span className="text-slate-400 block">End Date (1 Month)</span>
                  <span className="font-bold text-blue-700">{formatDate(selectedItem.validity.end_date)}</span>
                </div>
              </div>
            </div>

            {/* Vacate Action */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                disabled={vacating}
                onClick={handleVacateTenant}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <FiUser /> {vacating ? "Processing..." : `Vacate Tenant (${selectedItem.user.name})`}
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default QuickListOwner;
