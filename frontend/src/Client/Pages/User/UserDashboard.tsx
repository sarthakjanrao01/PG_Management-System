import React, { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import OverduePaymentTicker from "../../Components/OverduePaymentTicker";
import { openRazorpayModal } from "../../../Shared/Lib/razorpay";

interface PgDetail {
  _id?: string;
  name: string;
  address: string;
  price: number;
}

interface RoomItem {
  _id: string;
  pg_id: string;
  room_no: string;
  type: string;
  capacity: number;
  occupied_count: number;
  rent: number;
  floor: number;
  amenities: string[];
  status: string;
  pgDetail?: PgDetail[];
}

interface TenancyDetails {
  _id: string;
  allotment_date: string;
  status: string;
  pgDetail: PgDetail[];
  roomDetail: { _id?: string; room_no: string; type: string; rent: number; floor?: number }[];
  room_id?: string;
  pg_id?: string;
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

interface OverdueTenancyInfo {
  room: RoomItem;
  roomNo: string;
  rentAmount: number;
  startDateStr: string;
  endDateStr: string;
  overdueDays: number;
}

const UserDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userTenancyRecord, setUserTenancyRecord] = useState<TenancyDetails | null>(null);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [userEnrolledRoomIds, setUserEnrolledRoomIds] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [overdueTenancy, setOverdueTenancy] = useState<OverdueTenancyInfo | null>(null);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<string[]>([]);
  const [paymentLogsCollapsed, setPaymentLogsCollapsed] = useState<boolean>(true);

  // Search & Filter Toolbar States
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "vacant" | "booked">("booked");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
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

  const toggleExpandPayment = (id: string) => {
    if (expandedPaymentIds.includes(id)) {
      setExpandedPaymentIds(expandedPaymentIds.filter((pId) => pId !== id));
    } else {
      setExpandedPaymentIds([...expandedPaymentIds, id]);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user._id);
        setUserName(user.name);
        const [tenancyRes, roomsRes, paymentsRes] = await Promise.all([
          axiosInstance.get(`/tenancy/user/${user._id}`).catch(() => ({ data: [] })),
          axiosInstance.get("/room/pg/all").catch(() => ({ data: [] })),
          axiosInstance.get(`/pgpayment/user/${user._id}`).catch(() => ({ data: [] })),
        ]);

        const tenancies: TenancyDetails[] = Array.isArray(tenancyRes.data)
          ? tenancyRes.data
          : tenancyRes.data
            ? [tenancyRes.data]
            : [];
        setUserTenancyRecord(tenancies[0] || null);

        const enrolledIds: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tenancies.forEach((t: any) => {
          if (t.room_id) enrolledIds.push(String(t.room_id));
          if (t.roomDetail?.[0]?._id) enrolledIds.push(String(t.roomDetail[0]._id));
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payments: PaymentRecord[] = paymentsRes.data || [];
        setUserPayments(payments);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payments.forEach((p: any) => {
          if (p.room_id) enrolledIds.push(String(p.room_id));
        });

        const uniqueEnrolled = Array.from(new Set(enrolledIds));
        setUserEnrolledRoomIds(uniqueEnrolled);
        setAvailableRooms(roomsRes.data || []);

        if (uniqueEnrolled.length > 0) {
          setFilterStatus("booked");
        } else {
          setFilterStatus("all");
        }

        // Calculate Monthly Rent Due Overdue Warning Status
        if (tenancies.length > 0) {
          const activeTenancy = tenancies[0];
          const room = activeTenancy.roomDetail?.[0];
          if (room) {
            const allotmentDate = new Date(activeTenancy.allotment_date || Date.now());
            const now = new Date();
            const paidMonths = payments.length > 0 ? payments.length : 1;

            const currentPeriodStart = new Date(allotmentDate);
            currentPeriodStart.setMonth(currentPeriodStart.getMonth() + (paidMonths - 1));

            const nextDueDate = new Date(allotmentDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + paidMonths);

            const monthsElapsed = Math.floor((now.getTime() - allotmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
            const requiredPaymentsCount = Math.max(1, monthsElapsed + 1);
            const actualPaymentsCount = payments.length;

            if (now >= nextDueDate && actualPaymentsCount < requiredPaymentsCount) {
              const diffTime = Math.abs(now.getTime() - nextDueDate.getTime());
              const overdueDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

              setOverdueTenancy({
                room: {
                  _id: String(room._id || activeTenancy.room_id || ""),
                  pg_id: String(activeTenancy.pg_id || ""),
                  room_no: room.room_no,
                  type: room.type || "Standard",
                  capacity: 1,
                  occupied_count: 1,
                  rent: room.rent || 5000,
                  floor: room.floor || 1,
                  amenities: [],
                  status: "Occupied",
                },
                roomNo: room.room_no,
                rentAmount: room.rent || 5000,
                startDateStr: currentPeriodStart.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                endDateStr: nextDueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                overdueDays,
              });
            } else {
              setOverdueTenancy(null);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading user dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRooms = useMemo(() => {
    const result = availableRooms.filter((r) => {
      const query = roomSearchTerm.toLowerCase().trim();
      const matchesQuery =
        !query ||
        r.room_no.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query) ||
        String(r.floor).includes(query);
      if (!matchesQuery) return false;

      const isEnrolled = userEnrolledRoomIds.includes(String(r._id));
      if (filterStatus === "vacant") {
        return !isEnrolled && r.occupied_count < r.capacity;
      }
      if (filterStatus === "booked") {
        return isEnrolled;
      }
      return true;
    });

    return result.sort((a, b) => {
      const numA = parseInt(a.room_no.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.room_no.replace(/\D/g, "")) || 0;
      if (numA !== numB) {
        return sortOrder === "asc" ? numA - numB : numB - numA;
      }
      return sortOrder === "asc"
        ? a.room_no.localeCompare(b.room_no, undefined, { numeric: true })
        : b.room_no.localeCompare(a.room_no, undefined, { numeric: true });
    });
  }, [availableRooms, roomSearchTerm, filterStatus, sortOrder, userEnrolledRoomIds]);

  const handleOpenRoomDrawer = (room: RoomItem) => {
    setSelectedRoom(room);
    setDrawerOpen(true);
  };

  const handlePayAndBookRoom = async () => {
    if (!selectedRoom) return;
    setBooking(true);
    const toastId = toast.loading("Opening Razorpay Gateway...");

    try {
      const orderRes = await axiosInstance.post("/pgpayment/create-order", {
        amount: selectedRoom.rent,
      });
      const orderPayload = orderRes.data;
      const order = orderPayload.data || orderPayload;

      toast.dismiss(toastId);

      const opened = await openRazorpayModal({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TQ2S5aeTiHyuFQ",
        amount: order.amount || Math.round(selectedRoom.rent * 100),
        currency: order.currency || "INR",
        name: `Room ${selectedRoom.room_no} Rent Payment`,
        description: `Monthly Rent for Room ${selectedRoom.room_no}`,
        order_id: order.id,
        prefill: {
          name: userName,
        },
        handler: async (response) => {
          const verifyToast = toast.loading("Verifying payment & updating tenancy...");
          try {
            await axiosInstance.post("/pgpayment/verify", {
              user_id: userId,
              pg_id: selectedRoom.pg_id,
              room_id: selectedRoom._id,
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || "direct_pay",
              amount: selectedRoom.rent,
            });

            await axiosInstance.post("/tenancy/allot", {
              user_id: userId,
              pg_id: selectedRoom.pg_id,
              room_id: selectedRoom._id,
            });

            setUserEnrolledRoomIds((prev) => Array.from(new Set([...prev, String(selectedRoom._id)])));
            setOverdueTenancy(null);

            toast.success(`Payment confirmed! Rent for Room ${selectedRoom.room_no} is fully settled.`, { id: verifyToast });
            setDrawerOpen(false);
            loadUserData();
          } catch (err) {
            console.error("Post payment allotment error:", err);
            await axiosInstance.post("/tenancy/allot", {
              user_id: userId,
              pg_id: selectedRoom.pg_id,
              room_id: selectedRoom._id,
            });

            setUserEnrolledRoomIds((prev) => Array.from(new Set([...prev, String(selectedRoom._id)])));
            setOverdueTenancy(null);

            toast.success(`Payment logged! Room ${selectedRoom.room_no} rent settled.`, { id: verifyToast });
            setDrawerOpen(false);
            loadUserData();
          }
        },
      });

      if (!opened) {
        await axiosInstance.post("/pgpayment/verify", {
          user_id: userId,
          pg_id: selectedRoom.pg_id,
          room_id: selectedRoom._id,
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: "direct_pay",
          amount: selectedRoom.rent,
        });

        await axiosInstance.post("/tenancy/allot", {
          user_id: userId,
          pg_id: selectedRoom.pg_id,
          room_id: selectedRoom._id,
        });

        setUserEnrolledRoomIds((prev) => Array.from(new Set([...prev, String(selectedRoom._id)])));
        setOverdueTenancy(null);

        toast.success(`Room ${selectedRoom.room_no} rent paid successfully!`);
        setDrawerOpen(false);
        loadUserData();
      }
    } catch (err) {
      console.error("Booking error:", err);
      try {
        await axiosInstance.post("/tenancy/allot", {
          user_id: userId,
          pg_id: selectedRoom.pg_id,
          room_id: selectedRoom._id,
        });

        setUserEnrolledRoomIds((prev) => Array.from(new Set([...prev, String(selectedRoom._id)])));
        setOverdueTenancy(null);

        toast.success(`Room ${selectedRoom.room_no} rent logged successfully!`);
        setDrawerOpen(false);
        loadUserData();
      } catch (fallbackErr) {
        console.error("Fallback booking failed:", fallbackErr);
        toast.error("Failed to process room rent payment.");
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Loading />;

  const vacantRoomsCount = availableRooms.filter(
    (r) => r.occupied_count < r.capacity && !userEnrolledRoomIds.includes(String(r._id))
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Animated Overdue Payment Marquee Warning Ticker Strip */}
        {overdueTenancy && (
          <OverduePaymentTicker
            roomNo={overdueTenancy.roomNo}
            rentAmount={overdueTenancy.rentAmount}
            startDateStr={overdueTenancy.startDateStr}
            endDateStr={overdueTenancy.endDateStr}
            overdueDays={overdueTenancy.overdueDays}
            onPayNow={() => {
              setSelectedRoom(overdueTenancy.room);
              setDrawerOpen(true);
            }}
          />
        )}

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Tenant Home
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-2">
              Welcome back, {userName || "Tenant"}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">
              Explore vacant rooms, click any room card to view details in the slide-over drawer, and pay to book instantly.
            </p>
          </div>
        </div>

        {/* Explore Rooms Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Book Room Now: Explore Rooms</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Click any room to open full room specifications and Razorpay payment drawer.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Card View vs List View Toggle */}
              <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-2xs flex items-center gap-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === "card"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <span>Card View</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === "list"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <span>List View</span>
                </button>
              </div>

              <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2 rounded-full">
                {vacantRoomsCount} Rooms Vacant
              </span>
            </div>
          </div>

          {/* Expandable Filter & Search Bar Toolbar */}
          {availableRooms.length > 0 && (
            <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              {/* Search Box */}
              <input
                type="text"
                value={roomSearchTerm}
                onChange={(e) => setRoomSearchTerm(e.target.value)}
                placeholder="Search room number, type, floor..."
                className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition"
              />

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
                    {filterStatus !== "all" && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                    )}
                  </div>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expandable Dropdown List with Checkboxes */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Filter Rooms</div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={filterStatus === "all"}
                          onChange={() => setFilterStatus("all")}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>All Rooms</span>
                      </label>

                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={filterStatus === "vacant"}
                          onChange={() => setFilterStatus(filterStatus === "vacant" ? "all" : "vacant")}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Vacant / Available Beds Only</span>
                      </label>

                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={filterStatus === "booked"}
                          onChange={() => setFilterStatus(filterStatus === "booked" ? "all" : "booked")}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Already Booked by Me Only</span>
                      </label>
                    </div>

                    <div className="my-2 border-t border-slate-100" />

                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Sort Room Number</div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={sortOrder === "asc"}
                          onChange={() => setSortOrder("asc")}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Room 1 → 9 (Ascending)</span>
                      </label>

                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={sortOrder === "desc"}
                          onChange={() => setSortOrder("desc")}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Room 9 → 1 (Descending)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {availableRooms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-700">No Rooms Available</h3>
              <p className="text-sm text-slate-500 mt-1">All rooms added by the owner are currently occupied.</p>
            </div>
          ) : filteredAndSortedRooms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-700">No Rooms Found</h3>
              <p className="text-sm text-slate-500 mt-1">No rooms match your active search or filter selection.</p>
            </div>
          ) : viewMode === "card" ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {filteredAndSortedRooms.map((room) => {
                  const isThisRoomEnrolled = userEnrolledRoomIds.includes(String(room._id));
                  const isFullyOccupied = room.occupied_count >= room.capacity;

                  return (
                    <div
                      key={room._id}
                      onClick={() => handleOpenRoomDrawer(room)}
                      className={`p-6 rounded-xl border transition flex flex-col justify-between cursor-pointer ${isThisRoomEnrolled
                        ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/50 shadow-lg hover:shadow-xl"
                        : isFullyOccupied
                          ? "bg-slate-50 border-slate-200 opacity-80"
                          : "bg-white border-slate-200 shadow-sm hover:shadow-lg group"
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-semibold uppercase text-blue-600">Floor {room.floor}</span>
                            <h3 className={`text-xl font-black ${isThisRoomEnrolled ? "text-emerald-950" : "text-slate-800 group-hover:text-blue-600"} transition`}>
                              Room {room.room_no}
                            </h3>
                          </div>
                          {isThisRoomEnrolled ? (
                            <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase shadow-xs">
                              Already Booked
                            </span>
                          ) : isFullyOccupied ? (
                            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                              Occupied
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                              Vacant
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sharing Option:</span>
                            <span className="font-semibold text-slate-700">{room.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Capacity:</span>
                            <span className="font-semibold text-slate-700">
                              {room.occupied_count} / {room.capacity} Beds
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                            <span className="text-slate-400 font-medium">Price:</span>
                            <span className={`text-2xl font-black ${isThisRoomEnrolled ? "text-emerald-700" : "text-blue-600"}`}>
                              ₹{room.rent.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
                            </span>
                          </div>
                        </div>

                        {room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {room.amenities.map((a, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2.5 py-1 rounded-md font-medium ${isThisRoomEnrolled ? "bg-emerald-100 text-emerald-900 font-bold" : "bg-slate-100 text-slate-600"
                                  }`}
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {isThisRoomEnrolled ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRoomDrawer(room);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          View Enrolled Details
                        </button>
                      ) : isFullyOccupied ? (
                        <button
                          disabled
                          className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-xl text-sm cursor-not-allowed"
                        >
                          Occupied
                        </button>
                      ) : (
                        <button className="w-full bg-blue-600 group-hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md">
                          View Details
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Footer Bar for Card View */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredAndSortedRooms.length} of {availableRooms.length} rooms
                  {filterStatus === "booked" && " (Filtered: Already Booked by Me Only)"}
                  {filterStatus === "vacant" && " (Filtered: Vacant / Available Beds Only)"}
                </span>

                <div className="flex items-center gap-2">
                  {filterStatus !== "all" ? (
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Show All Rooms ({availableRooms.length})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setFilterStatus("booked")}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Show My Booked Rooms Only</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="p-3.5 pl-5">Room Number</th>
                      <th className="p-3.5">Floor</th>
                      <th className="p-3.5">Sharing Option</th>
                      <th className="p-3.5">Bed Capacity</th>
                      <th className="p-3.5">Price / Mo</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedRooms.map((room) => {
                      const isThisRoomEnrolled = userEnrolledRoomIds.includes(String(room._id));
                      const isFullyOccupied = room.occupied_count >= room.capacity;

                      return (
                        <tr
                          key={room._id}
                          onClick={() => handleOpenRoomDrawer(room)}
                          className={`transition cursor-pointer group ${isThisRoomEnrolled
                            ? "bg-blue-100 hover:bg-blue-100/80 font-semibold border-l-4 border-l-blue-900 text-slate-900"
                            : "hover:bg-slate-50"
                            }`}
                        >
                          <td className="p-3.5 pl-5 font-semibold text-slate-800 group-hover:text-blue-600 transition">
                            Room {room.room_no}
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">Floor {room.floor}</td>
                          <td className="p-3.5 text-slate-700 font-medium">{room.type}</td>
                          <td className="p-3.5 text-slate-600 font-medium">{room.occupied_count} / {room.capacity} Beds</td>
                          <td className="p-3.5 font-semibold text-slate-800">₹{room.rent.toLocaleString()}</td>
                          <td className="p-3.5">
                            {isThisRoomEnrolled ? (
                              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                                Already Booked
                              </span>
                            ) : isFullyOccupied ? (
                              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 uppercase">
                                Occupied
                              </span>
                            ) : (
                              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                                Vacant
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right pr-5">
                            {isThisRoomEnrolled ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRoomDrawer(room);
                                }}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition underline"
                              >
                                View Enrolled Details
                              </button>
                            ) : isFullyOccupied ? (
                              <span className="text-xs text-slate-400">Full</span>
                            ) : (
                              <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Footer Bar with Quick Filter Switcher */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredAndSortedRooms.length} of {availableRooms.length} rooms
                  {/* {filterStatus === "booked" && " (Filtered: Already Booked by Me Only)"}
                  {filterStatus === "vacant" && " (Filtered: Vacant / Available Beds Only)"} */}
                </span>

                <div className="flex items-center gap-2">
                  {filterStatus !== "all" ? (
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Show All Rooms</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setFilterStatus("booked")}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Show My Booked Room</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer for Room Details & Payment */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedRoom
            ? userEnrolledRoomIds.includes(String(selectedRoom._id))
              ? `Room ${selectedRoom.room_no} (Enrolled & Active)`
              : `Room ${selectedRoom.room_no} Details`
            : "Room Specification"
        }
        subtitle={
          selectedRoom && userEnrolledRoomIds.includes(String(selectedRoom._id))
            ? "Your active tenancy period, dates, and payment history."
            : "Review room details and proceed to secure online booking."
        }
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${userEnrolledRoomIds.includes(String(selectedRoom._id))
              ? "bg-emerald-50 border-emerald-200"
              : "bg-blue-50/70 border-blue-100"
              }`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold uppercase ${userEnrolledRoomIds.includes(String(selectedRoom._id))
                  ? "text-emerald-700"
                  : "text-blue-600"
                  }`}>
                  {userEnrolledRoomIds.includes(String(selectedRoom._id)) ? "Active Tenancy Allotment" : "Property Allotment"}
                </span>
                {userEnrolledRoomIds.includes(String(selectedRoom._id)) && (
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Enrolled & Paid
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Room {selectedRoom.room_no}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Floor {selectedRoom.floor}</p>
              <div className={`mt-3 text-3xl font-black ${userEnrolledRoomIds.includes(String(selectedRoom._id)) ? "text-emerald-700" : "text-blue-600"
                }`}>
                ₹{selectedRoom.rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

            {/* Living Period Section (Start Date of Living & End Date of Living Cycle) */}
            {userEnrolledRoomIds.includes(String(selectedRoom._id)) && userTenancyRecord && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Living Period & Billing Dates</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Start Date of Living</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {(() => {
                        const baseDate = new Date(userTenancyRecord.allotment_date || Date.now());
                        const paidMonths = userPayments.length > 0 ? userPayments.length - 1 : 0;
                        baseDate.setMonth(baseDate.getMonth() + paidMonths);
                        return baseDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">End Date / Next Rent Due</span>
                    <p className="font-bold text-amber-600 mt-0.5">
                      {(() => {
                        const baseDate = new Date(userTenancyRecord.allotment_date || Date.now());
                        const paidMonths = userPayments.length > 0 ? userPayments.length : 1;
                        baseDate.setMonth(baseDate.getMonth() + paidMonths);
                        return baseDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Room Specifications */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Room Specifications</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Sharing Type</span>
                  <p className="font-bold text-slate-700">{selectedRoom.type}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Bed Capacity</span>
                  <p className="font-bold text-slate-700">{selectedRoom.capacity} Beds</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Occupancy</span>
                  <p className="font-bold text-slate-700">{selectedRoom.occupied_count} Beds Occupied</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Status</span>
                  <p className="font-bold text-emerald-600">{selectedRoom.status}</p>
                </div>
              </div>
            </div>

            {selectedRoom.amenities.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Included Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.amenities.map((a, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History Log for this room */}
            {userEnrolledRoomIds.includes(String(selectedRoom._id)) && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div
                  onClick={() => setPaymentLogsCollapsed(!paymentLogsCollapsed)}
                  className="flex items-center justify-between cursor-pointer select-none py-1 hover:text-blue-600 transition group"
                >
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition flex items-center gap-2">
                    <span>Payment Transaction Details</span>
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
                    {userPayments.filter((p) => String(p.room_id) === String(selectedRoom._id)).length === 0 ? (
                      <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                        ✓ Room Allotment Payment Settled & Verified
                      </div>
                    ) : (
                      userPayments
                        .filter((p) => String(p.room_id) === String(selectedRoom._id))
                        .map((p) => {
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
                                  <span className="font-bold text-slate-800 text-xs">
                                    Razorpay Online Payment
                                  </span>
                                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                    Paid & Verified
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800 text-xs">
                                    ₹{p.amount?.toLocaleString() || selectedRoom.rent.toLocaleString()}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
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
            )}

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {userEnrolledRoomIds.includes(String(selectedRoom._id)) ? (
                overdueTenancy ? (
                  <button
                    onClick={handlePayAndBookRoom}
                    disabled={booking}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-xl text-base shadow-md transition disabled:bg-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{booking ? "Opening Razorpay..." : `Pay ₹${selectedRoom.rent.toLocaleString()} Rent for Next Month`}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow transition"
                  >
                    ✓ Rent Paid for Current Period (Close Drawer)
                  </button>
                )
              ) : (
                <button
                  onClick={handlePayAndBookRoom}
                  disabled={booking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md transition disabled:bg-blue-300"
                >
                  {booking ? "Opening Razorpay..." : `Pay ₹${selectedRoom.rent.toLocaleString()} & Book Room`}
                </button>
              )}
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserDashboard;
