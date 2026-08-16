import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";

interface RoomItem {
  _id: string;
  room_no: string;
  type: string;
  capacity: number;
  occupied_count: number;
  rent: number;
  floor: number;
  amenities: string[];
  status: string;
}

interface OccupantItem {
  _id: string;
  allotment_date: string;
  status: string;
  userDetail?: { _id: string; name: string; email: string; phone?: string; mobile_number?: string }[];
}

interface OverdueTenantItem {
  _id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  room_no: string;
  type: string;
  rent: number;
  startDateStr: string;
  endDateStr: string;
  overdueDays: number;
}

interface AnalyticsData {
  totalRooms: number;
  totalOccupiedBeds: number;
  vacantBeds: number;
  totalTenants: number;
  totalRevenue: number;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "vacant" | "occupied">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dashboardView, setDashboardView] = useState<"rooms" | "overdue">("rooms");
  const [overdueTenants, setOverdueTenants] = useState<OverdueTenantItem[]>([]);

  // Filter dropdown state & click outside ref
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

  // Filtered and sorted rooms list
  const filteredAndSortedRooms = useMemo(() => {
    const result = rooms.filter((r) => {
      const query = roomSearchTerm.toLowerCase().trim();
      const matchesQuery = !query || r.room_no.toLowerCase().includes(query) || r.type.toLowerCase().includes(query);
      if (!matchesQuery) return false;

      if (filterStatus === "vacant") {
        return r.status === "Vacant" || r.status === "Partially Occupied" || r.occupied_count < r.capacity;
      }
      if (filterStatus === "occupied") {
        return r.status === "Fully Occupied" || r.occupied_count >= r.capacity;
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
  }, [rooms, roomSearchTerm, filterStatus, sortOrder]);

  // Bulk Checkbox Selection State
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Slide Over Drawer state for managing selected room
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "occupants">("details");
  const [occupants, setOccupants] = useState<OccupantItem[]>([]);
  const [loadingOccupants, setLoadingOccupants] = useState(false);

  // Edit form state inside drawer
  const [roomNo, setRoomNo] = useState("");
  const [type, setType] = useState("Single");
  const [capacity, setCapacity] = useState(1);
  const [rent, setRent] = useState(5000);
  const [floor, setFloor] = useState(1);
  const [amenitiesInput, setAmenitiesInput] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setOwnerName(user.name);
        const [analyticsRes, roomsRes, quickRes] = await Promise.all([
          axiosInstance.get(`/owner/analytics/${user._id}`).catch(() => ({ data: null })),
          axiosInstance.get("/room/pg/all").catch(() => ({ data: [] })),
          axiosInstance.get("/tenancy/quick-list/all").catch(() => ({ data: [] })),
        ]);

        setAnalytics(analyticsRes.data);
        setRooms(roomsRes.data || []);

        // Process Overdue & Extra Living Tenants List
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allQuick: any[] = quickRes.data || [];
        const now = new Date();
        const overdueList: OverdueTenantItem[] = [];

        allQuick.forEach((item) => {
          if (item.validity?.end_date) {
            const endDate = new Date(item.validity.end_date);
            const startDate = new Date(item.validity.start_date || item.allotment_date || Date.now());

            const monthsElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
            const requiredPaymentsCount = Math.max(1, monthsElapsed + 1);
            const actualPaymentsCount = item.payment?.payment_count || (item.payment?.status === "Paid" ? 1 : 0);

            if (now >= endDate && actualPaymentsCount < requiredPaymentsCount) {
              const diffTime = Math.abs(now.getTime() - endDate.getTime());
              const overdueDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

              overdueList.push({
                _id: item._id,
                user_name: item.user?.name || "Occupant",
                user_email: item.user?.email || "",
                user_mobile: item.user?.mobile_number || "N/A",
                room_no: item.room?.room_no || "N/A",
                type: item.room?.type || "Standard",
                rent: item.room?.rent || 0,
                startDateStr: startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                endDateStr: endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                overdueDays,
              });
            }
          }
        });

        setOverdueTenants(overdueList);
      }
    } catch (err) {
      console.error("Error loading owner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoomDrawer = (room: RoomItem) => {
    setSelectedRoom(room);
    setRoomNo(room.room_no);
    setType(room.type);
    setCapacity(room.capacity);
    setRent(room.rent);
    setFloor(room.floor);
    setAmenitiesInput(room.amenities.join(", "));
    setEditing(false);
    setActiveTab("details");
    setDrawerOpen(true);
    fetchOccupants(room._id);
  };

  const fetchOccupants = async (roomId: string) => {
    setLoadingOccupants(true);
    try {
      const res = await axiosInstance.get(`/tenancy/room/${roomId}`);
      setOccupants(res.data || []);
    } catch (err) {
      console.error("Error fetching room occupants:", err);
    } finally {
      setLoadingOccupants(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const toastId = toast.loading("Updating room details...");
    try {
      const amenitiesArr = amenitiesInput.split(",").map((s) => s.trim()).filter(Boolean);
      await axiosInstance.put(`/room/${selectedRoom._id}`, {
        room_no: roomNo,
        type,
        capacity: Number(capacity),
        rent: Number(rent),
        floor: Number(floor),
        amenities: amenitiesArr,
      });

      toast.success("Room updated successfully!", { id: toastId });
      setEditing(false);
      setDrawerOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error("Error updating room:", err);
      toast.error("Failed to update room.", { id: toastId });
    }
  };

  const handleDeleteSingleRoom = async (roomId: string) => {
    const toastId = toast.loading("Deleting room...");
    try {
      await axiosInstance.delete(`/room/${roomId}`);
      toast.success("Room deleted successfully!", { id: toastId });
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting room:", err);
      toast.error("Failed to delete room.", { id: toastId });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRoomIds.length === filteredAndSortedRooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(filteredAndSortedRooms.map((r) => r._id));
    }
  };

  const handleToggleSelectRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRoomIds.includes(roomId)) {
      setSelectedRoomIds(selectedRoomIds.filter((id) => id !== roomId));
    } else {
      setSelectedRoomIds([...selectedRoomIds, roomId]);
    }
  };

  const handleDeleteSelectedRooms = async () => {
    if (selectedRoomIds.length === 0) return;
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 font-sans">
        <p className="font-black text-rose-600 text-sm">Delete {selectedRoomIds.length} Selected Room(s)?</p>
        <p className="text-xs text-slate-600">Are you sure you want to permanently delete the selected rooms from the database?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs bg-slate-100 font-semibold rounded-lg text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading(`Deleting ${selectedRoomIds.length} rooms...`);
              try {
                await Promise.all(selectedRoomIds.map((id) => axiosInstance.delete(`/room/${id}`)));
                toast.success(`${selectedRoomIds.length} room(s) deleted successfully!`, { id: toastId });
                setRooms((prev) => prev.filter((r) => !selectedRoomIds.includes(r._id)));
                setSelectedRoomIds([]);
              } catch (err) {
                console.error("Error deleting selected rooms:", err);
                toast.error("Failed to delete selected rooms.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const handleDeleteAllRooms = async () => {
    if (rooms.length === 0) return;
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 font-sans">
        <p className="font-black text-rose-600 text-sm">Delete ALL {rooms.length} Rooms?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete all room records from the database?</p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs bg-slate-100 font-semibold rounded-lg text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading("Deleting all rooms...");
              try {
                await axiosInstance.delete("/room/clear-all");
                toast.success("All rooms deleted successfully!", { id: toastId });
                setRooms([]);
                setSelectedRoomIds([]);
                setDrawerOpen(false);
              } catch (err) {
                console.error("Error deleting all rooms:", err);
                toast.error("Failed to delete all rooms.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Delete All
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const handleSendReminderToast = (tenantName: string, roomNo: string) => {
    toast.success(`Payment & Overdue Rent Reminder sent to ${tenantName} (Room ${roomNo})!`);
  };

  if (loading) return <Loading />;

  const isAllSelected = filteredAndSortedRooms.length > 0 && selectedRoomIds.length === filteredAndSortedRooms.length;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              PG Owner Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-2">
              Welcome back, {ownerName || "Owner"}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">
              Manage your created rooms, view active occupants, and track overdue rent tenants.
            </p>
          </div>
          <button
            onClick={() => navigate("/owner/add-room")}
            className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold px-5 py-3 rounded-xl shadow transition text-sm shrink-0"
          >
            + Add New Room
          </button>
        </div>

        {/* Navigation View Switcher (Created Rooms vs Overdue Tenants) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDashboardView("rooms")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  dashboardView === "rooms"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Created Rooms Directory ({rooms.length})
              </button>
              <button
                onClick={() => setDashboardView("overdue")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  dashboardView === "overdue"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <span>Overdue & Pending Rent Tenants</span>
                {overdueTenants.length > 0 && (
                  <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {overdueTenants.length}
                  </span>
                )}
              </button>
            </div>

            {dashboardView === "rooms" && rooms.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedRoomIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelectedRooms}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>Delete Selected ({selectedRoomIds.length})</span>
                  </button>
                )}
                <button
                  onClick={handleDeleteAllRooms}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition border border-rose-200"
                >
                  Delete All Rooms
                </button>
              </div>
            )}
          </div>

          {/* VIEW 1: CREATED ROOMS LIST */}
          {dashboardView === "rooms" ? (
            <>
              {rooms.length > 0 && (
                <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={roomSearchTerm}
                    onChange={(e) => setRoomSearchTerm(e.target.value)}
                    placeholder="Search room number..."
                    className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition"
                  />

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
                            <span>Vacant & Partially Vacant</span>
                          </label>

                          <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={filterStatus === "occupied"}
                              onChange={() => setFilterStatus(filterStatus === "occupied" ? "all" : "occupied")}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span>Fully Occupied Only</span>
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

              {rooms.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
                  <h3 className="text-base font-bold text-slate-700">No Rooms Created Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Click "+ Add New Room" to add rooms to your PG.</p>
                  <button
                    onClick={() => navigate("/owner/add-room")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                  >
                    + Add Room Now
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                          <th className="p-3.5 pl-5 w-10">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleToggleSelectAll}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              title="Select / Deselect All Rooms"
                            />
                          </th>
                          <th className="p-3.5">Room No</th>
                          <th className="p-3.5">Floor</th>
                          <th className="p-3.5">Sharing Option</th>
                          <th className="p-3.5">Bed Capacity</th>
                          <th className="p-3.5">Price / Mo</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAndSortedRooms.map((room) => (
                          <tr
                            key={room._id}
                            onClick={() => handleOpenRoomDrawer(room)}
                            className={`hover:bg-slate-50 transition cursor-pointer group ${
                              selectedRoomIds.includes(room._id) ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <td className="p-3.5 pl-5 w-10" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedRoomIds.includes(room._id)}
                                onChange={(e) => handleToggleSelectRoom(room._id, e as any)}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800">
                              Room {room.room_no}
                            </td>
                            <td className="p-3.5 text-slate-600 font-medium">
                              Floor {room.floor}
                            </td>
                            <td className="p-3.5 text-slate-700 font-medium">
                              {room.type}
                            </td>
                            <td className="p-3.5 text-slate-600 font-medium">
                              {room.occupied_count} / {room.capacity} Beds
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800">
                              ₹{room.rent.toLocaleString()}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                                  room.status === "Vacant"
                                    ? "bg-emerald-50 text-emerald-700 uppercase"
                                    : room.status === "Fully Occupied"
                                    ? "bg-rose-50 text-rose-700 uppercase"
                                    : "bg-amber-50 text-amber-700 uppercase"
                                }`}
                              >
                                {room.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => handleOpenRoomDrawer(room)}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                                >
                                  Manage Specs
                                </button>
                                <button
                                  onClick={() => handleDeleteSingleRoom(room._id)}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Quick Increment Row */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {filteredAndSortedRooms.length} of {rooms.length} rooms
                    </span>
                    <button
                      onClick={() => navigate("/owner/add-room")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
                    >
                      <span>+ Add Next Room (Quick Increment)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* VIEW 2: OVERDUE & EXTRA LIVING TENANTS LIST */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-amber-50 border-b border-amber-200 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-amber-950 text-base">Overdue Rent & Extra Living Tenants Directory</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Tenants whose 1-month living period has expired without rent payment.
                  </p>
                </div>
                <span className="bg-amber-200 text-amber-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                  {overdueTenants.length} Overdue
                </span>
              </div>

              {overdueTenants.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <h4 className="font-bold text-slate-700 text-base">No Overdue Tenants!</h4>
                  <p className="text-xs text-slate-500 mt-1">All occupants have settled their monthly rent payments on time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <th className="p-3.5 pl-5">Tenant Name & Mobile</th>
                        <th className="p-3.5">Room No</th>
                        <th className="p-3.5">Living Period</th>
                        <th className="p-3.5">Extra Living</th>
                        <th className="p-3.5">Pending Rent</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overdueTenants.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 pl-5 font-semibold text-slate-800">
                            <div>{item.user_name}</div>
                            <div className="text-xs text-slate-400 font-medium">{item.user_mobile}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">Room {item.room_no}</td>
                          <td className="p-3.5 text-xs text-slate-600 font-medium">
                            {item.startDateStr} – {item.endDateStr}
                          </td>
                          <td className="p-3.5 font-black text-rose-600 text-xs">
                            +{item.overdueDays} Day{item.overdueDays > 1 ? "s" : ""} Overdue
                          </td>
                          <td className="p-3.5 font-bold text-amber-700">₹{item.rent.toLocaleString()}</td>
                          <td className="p-3.5">
                            <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase shadow-2xs">
                              Overdue Living
                            </span>
                          </td>
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end gap-2">
                              {item.user_mobile && item.user_mobile !== "N/A" && (
                                <a
                                  href={`tel:${item.user_mobile}`}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md transition"
                                >
                                  Call
                                </a>
                              )}
                              <button
                                onClick={() => handleSendReminderToast(item.user_name, item.room_no)}
                                className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md transition"
                              >
                                Send Reminder
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRoom ? `Room ${selectedRoom.room_no} Specs` : "Room Specification"}
        subtitle="View and manage room details and current occupants."
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className="flex border-b border-slate-200 pb-2 gap-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-xs font-bold pb-1 transition border-b-2 ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Room Details
              </button>
              <button
                onClick={() => setActiveTab("occupants")}
                className={`text-xs font-bold pb-1 transition border-b-2 ${
                  activeTab === "occupants"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Current Occupants ({selectedRoom.occupied_count})
              </button>
            </div>

            {activeTab === "details" ? (
              editing ? (
                <form onSubmit={handleUpdateRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sharing Option</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Four">Four</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Bed Capacity</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Price per Month (₹)</label>
                    <input
                      type="number"
                      value={rent}
                      onChange={(e) => setRent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Floor</label>
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amenities (Comma separated)</label>
                    <input
                      type="text"
                      value={amenitiesInput}
                      onChange={(e) => setAmenitiesInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-blue-600 uppercase">Room Overview</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">Room {selectedRoom.room_no}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Floor {selectedRoom.floor}</p>
                    <div className="mt-2 text-2xl font-black text-blue-600">
                      ₹{selectedRoom.rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400">Sharing</span>
                      <p className="font-bold text-slate-700">{selectedRoom.type}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400">Bed Capacity</span>
                      <p className="font-bold text-slate-700">{selectedRoom.capacity} Beds</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400">Occupancy</span>
                      <p className="font-bold text-slate-700">{selectedRoom.occupied_count} Beds Occupied</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400">Status</span>
                      <p className="font-bold text-emerald-600">{selectedRoom.status}</p>
                    </div>
                  </div>

                  {selectedRoom.amenities.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-slate-700 mb-1.5">Amenities</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRoom.amenities.map((a, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition"
                    >
                      Edit Specifications
                    </button>
                    <button
                      onClick={() => handleDeleteSingleRoom(selectedRoom._id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2.5 rounded-xl text-xs border border-rose-200 transition"
                    >
                      Delete Room
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {loadingOccupants ? (
                  <div className="text-center py-8 text-slate-500 text-xs">Loading occupants...</div>
                ) : occupants.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl">
                    No active occupants in Room {selectedRoom.room_no}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {occupants.map((occ) => {
                      const user = occ.userDetail?.[0];
                      return (
                        <div key={occ._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{user?.name || "Occupant"}</span>
                            <span className="text-emerald-600 font-medium">{occ.status}</span>
                          </div>
                          <div className="text-slate-500">{user?.email || "No email"}</div>
                          <div className="text-slate-500">
                            Mobile: <span className="font-semibold text-slate-700">{user?.phone || user?.mobile_number || "N/A"}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] pt-1">
                            Allotted: {new Date(occ.allotment_date).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default OwnerDashboard;
