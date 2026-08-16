import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import { FiSearch, FiTrash2 } from "react-icons/fi";

interface RoomDetails {
  _id: string;
  room_no: string;
  type: string;
  capacity: number;
  rent: number;
  floor: number;
  amenities: string[];
  status: string;
}

interface PgDetails {
  _id: string;
  name: string;
  address: string;
}

interface TenancyRecord {
  _id: string;
  allotment_date: string;
  status: string;
  pgDetail: PgDetails[];
  roomDetail: RoomDetails[];
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

const MyRoomDetails: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tenancies, setTenancies] = useState<TenancyRecord[]>([]);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [allRooms, setAllRooms] = useState<RoomDetails[]>([]);
  const [selectedTenancy, setSelectedTenancy] = useState<TenancyRecord | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearing, setClearing] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<string[]>([]);
  const [paymentLogsCollapsed, setPaymentLogsCollapsed] = useState<boolean>(true);

  const toggleExpandPayment = (id: string) => {
    if (expandedPaymentIds.includes(id)) {
      setExpandedPaymentIds(expandedPaymentIds.filter((pId) => pId !== id));
    } else {
      setExpandedPaymentIds([...expandedPaymentIds, id]);
    }
  };

  useEffect(() => {
    loadMyRooms();
  }, []);

  const loadMyRooms = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        const role = (user.role || "").toLowerCase();
        if (role === "superadmin") {
          setIsSuperAdmin(true);
          const res = await axiosInstance.get("/room/pg/all").catch(() => ({ data: [] }));
          setAllRooms(res.data || []);
        } else {
          setIsSuperAdmin(false);
          const [tenancyRes, paymentsRes] = await Promise.all([
            axiosInstance.get(`/tenancy/user/${user._id}`).catch(() => ({ data: [] })),
            axiosInstance.get(`/pgpayment/user/${user._id}`).catch(() => ({ data: [] })),
          ]);

          if (tenancyRes.data) {
            setTenancies(Array.isArray(tenancyRes.data) ? tenancyRes.data : [tenancyRes.data]);
          }
          setUserPayments(paymentsRes.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading room details:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuperAdminRooms = useMemo(() => {
    return allRooms.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        r.room_no.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        String(r.floor).includes(q)
      );
    });
  }, [allRooms, searchTerm]);

  const handleDeleteSingleRoom = async (roomId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const toastId = toast.loading("Deleting room...");
    try {
      await axiosInstance.delete(`/room/${roomId}`);
      toast.success("Room deleted successfully!", { id: toastId });
      setAllRooms((prev) => prev.filter((r) => r._id !== roomId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting room:", err);
      toast.error("Failed to delete room.", { id: toastId });
    }
  };

  const handleClearAllRooms = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 font-sans">
        <p className="font-black text-rose-600 text-sm">Delete ALL System Rooms?</p>
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
              setClearing(true);
              const toastId = toast.loading("Deleting all rooms...");
              try {
                await axiosInstance.delete("/room/clear-all");
                toast.success("All rooms deleted successfully!", { id: toastId });
                setAllRooms([]);
                setDrawerOpen(false);
              } catch (err) {
                console.error("Error deleting all rooms:", err);
                toast.error("Failed to clear rooms.", { id: toastId });
              } finally {
                setClearing(false);
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

  const handleOpenRoomDrawer = (item: TenancyRecord | RoomDetails) => {
    if (isSuperAdmin) {
      setSelectedRoom(item as RoomDetails);
      setSelectedTenancy(null);
    } else {
      setSelectedTenancy(item as TenancyRecord);
      setSelectedRoom(null);
    }
    setDrawerOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isSuperAdmin ? "System Rooms Directory (Super Admin)" : "My Enrolled Rooms"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isSuperAdmin
                ? "Global room inventory across all PG properties. Click any room row to manage details or remove."
                : "View all rooms you are currently enrolled in. Click any room list item to open the details panel."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-2xs flex items-center gap-1">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "card"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                List View
              </button>
            </div>

            {isSuperAdmin && allRooms.length > 0 && (
              <button
                onClick={handleClearAllRooms}
                disabled={clearing}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition border border-rose-200 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiTrash2 />
                {clearing ? "Deleting..." : "Clear All Rooms"}
              </button>
            )}
          </div>
        </div>

        {/* Super Admin Toolbar */}
        {isSuperAdmin && allRooms.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-4 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search room number, type, floor..."
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
          </div>
        )}

        {/* Content Section */}
        {isSuperAdmin ? (
          filteredSuperAdminRooms.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
              <h3 className="text-base font-bold text-slate-700">No Rooms Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no PG rooms matching your search filter.</p>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuperAdminRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleOpenRoomDrawer(room)}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold uppercase text-purple-600">Floor {room.floor}</span>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition">
                          Room {room.room_no}
                        </h3>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                        {room.status || "Vacant"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sharing Type:</span>
                        <span className="font-semibold text-slate-700">{room.type}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-slate-400 font-medium">Rent:</span>
                        <span className="text-2xl font-black text-purple-700">
                          ₹{(room.rent || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button className="text-xs font-semibold text-purple-600 hover:text-purple-800">
                      Manage Specs
                    </button>
                    <button
                      onClick={(e) => handleDeleteSingleRoom(room._id, e)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="p-3.5 pl-5">Room Number</th>
                      <th className="p-3.5">Floor</th>
                      <th className="p-3.5">Sharing Type</th>
                      <th className="p-3.5">Monthly Rent</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSuperAdminRooms.map((room) => (
                      <tr
                        key={room._id}
                        onClick={() => handleOpenRoomDrawer(room)}
                        className="hover:bg-slate-50 transition cursor-pointer group"
                      >
                        <td className="p-3.5 pl-5 font-semibold text-slate-800 group-hover:text-purple-600 transition">
                          Room {room.room_no}
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">Floor {room.floor}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{room.type}</td>
                        <td className="p-3.5 font-semibold text-slate-800">₹{(room.rent || 0).toLocaleString()}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded uppercase ${
                              room.status === "Vacant"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {room.status || "Vacant"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenRoomDrawer(room)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition"
                            >
                              Manage
                            </button>
                            <button
                              onClick={(e) => handleDeleteSingleRoom(room._id, e)}
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
            </div>
          )
        ) : tenancies.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500 text-sm">
            <h3 className="text-base font-bold text-slate-700">No Enrolled Rooms Found</h3>
            <p className="text-xs text-slate-500 mt-1">You have not booked or enrolled in any room yet.</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenancies.map((t) => {
              const room = t.roomDetail?.[0];
              if (!room) return null;
              return (
                <div
                  key={t._id}
                  onClick={() => handleOpenRoomDrawer(t)}
                  className="bg-blue-50/90 border border-blue-500 p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-blue-700">Floor {room.floor}</span>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-800 transition">
                          Room {room.room_no}
                        </h3>
                      </div>
                      <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sharing Option:</span>
                        <span className="font-semibold text-slate-800">{room.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Move-In Date:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(t.allotment_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                        <span className="text-slate-500 font-medium">Monthly Rent:</span>
                        <span className="text-2xl font-black text-blue-700">
                          ₹{room.rent.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 group-hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs">
                    View Complete Details
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Room Number</th>
                    <th className="p-3.5">Floor</th>
                    <th className="p-3.5">Sharing Type</th>
                    <th className="p-3.5">Monthly Rent</th>
                    <th className="p-3.5">Move-In Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenancies.map((t) => {
                    const room = t.roomDetail?.[0];
                    if (!room) return null;

                    return (
                      <tr
                        key={t._id}
                        onClick={() => handleOpenRoomDrawer(t)}
                        className="bg-blue-100/60 hover:bg-blue-100/80 font-semibold border-l-4 border-l-blue-900 transition cursor-pointer group"
                      >
                        <td className="p-3.5 pl-5 font-semibold text-slate-800 group-hover:text-blue-600 transition">
                          Room {room.room_no}
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">Floor {room.floor}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{room.type}</td>
                        <td className="p-3.5 font-semibold text-slate-800">₹{room.rent.toLocaleString()}</td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {new Date(t.allotment_date).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          isSuperAdmin
            ? selectedRoom
              ? `Manage Room ${selectedRoom.room_no}`
              : "Room Info"
            : selectedTenancy?.roomDetail?.[0]
            ? `Room ${selectedTenancy.roomDetail[0].room_no} (Enrolled & Active)`
            : "Room Info"
        }
        subtitle="Complete details, living dates, and payment transaction history."
      >
        {isSuperAdmin && selectedRoom ? (
          <div className="space-y-6">
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-purple-700 uppercase">Super Admin Room Control</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Room {selectedRoom.room_no}</h3>
              <div className="mt-3 text-3xl font-black text-purple-700">
                ₹{selectedRoom.rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Room Specifications</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Room Sharing</span>
                  <p className="font-bold text-slate-700">{selectedRoom.type}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Floor</span>
                  <p className="font-bold text-slate-700">Floor {selectedRoom.floor}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Capacity</span>
                  <p className="font-bold text-slate-700">{selectedRoom.capacity} Beds</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Current Status</span>
                  <p className="font-bold text-emerald-600">{selectedRoom.status || "Vacant"}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => handleDeleteSingleRoom(selectedRoom._id)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm shadow transition flex items-center justify-center gap-2"
              >
                <FiTrash2 />
                Delete Room from Database
              </button>
            </div>
          </div>
        ) : (
          selectedTenancy && selectedTenancy.roomDetail?.[0] && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Active Tenancy Allotment</span>
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Enrolled & Paid
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  Room {selectedTenancy.roomDetail[0].room_no}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Floor {selectedTenancy.roomDetail[0].floor}</p>
                <div className="mt-3 text-3xl font-black text-emerald-700">
                  ₹{selectedTenancy.roomDetail[0].rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
              </div>

              {/* Living Period & Billing Dates Section */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Living Period & Billing Dates</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Start Date of Living</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {(() => {
                        const baseDate = new Date(selectedTenancy.allotment_date || Date.now());
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
                        const baseDate = new Date(selectedTenancy.allotment_date || Date.now());
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

              {/* Room Specifications */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm">Room Specifications</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Sharing Type</span>
                    <p className="font-bold text-slate-700">{selectedTenancy.roomDetail[0].type}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Bed Capacity</span>
                    <p className="font-bold text-slate-700">{selectedTenancy.roomDetail[0].capacity || 1} Beds</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Occupancy</span>
                    <p className="font-bold text-slate-700">Occupied</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Status</span>
                    <p className="font-bold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>

              {selectedTenancy.roomDetail[0].amenities && selectedTenancy.roomDetail[0].amenities.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">Included Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTenancy.roomDetail[0].amenities.map((a, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Payment Transaction Details */}
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
                    {userPayments.length === 0 ? (
                      <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                        ✓ Room Allotment Payment Settled & Verified
                      </div>
                    ) : (
                      userPayments.map((p) => {
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
                                  ₹{p.amount?.toLocaleString() || selectedTenancy.roomDetail[0].rent.toLocaleString()}
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

              {/* Footer Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow transition"
                >
                  ✓ Room Enrolled & Active (Close Drawer)
                </button>
              </div>
            </div>
          )
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default MyRoomDetails;
