import React, { useEffect, useState } from "react";
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
  userDetail?: { _id: string; name: string; email: string; phone?: string }[];
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
        const [analyticsRes, roomsRes] = await Promise.all([
          axiosInstance.get(`/owner/analytics/${user._id}`),
          axiosInstance.get("/room/pg/all"),
        ]);
        setAnalytics(analyticsRes.data);
        setRooms(roomsRes.data || []);
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

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-sm">Delete Room {selectedRoom.room_no}?</p>
        <p className="text-xs text-slate-500">This action cannot be undone.</p>
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
              const toastId = toast.loading("Deleting room...");
              try {
                await axiosInstance.delete(`/room/${selectedRoom._id}`);
                toast.success("Room deleted successfully!", { id: toastId });
                setDrawerOpen(false);
                loadDashboardData();
              } catch (err) {
                console.error("Error deleting room:", err);
                toast.error("Failed to delete room.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleDeleteAllRooms = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-black text-rose-600 text-sm">Delete ALL Rooms?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete all created rooms from database?</p>
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
                toast.success("All rooms deleted from database successfully!", { id: toastId });
                setRooms([]);
                loadDashboardData();
              } catch (err) {
                console.error("Error deleting all rooms:", err);
                toast.error("Failed to delete all rooms.", { id: toastId });
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white shadow-xs"
          >
            Yes, Delete All
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  if (loading) return <Loading />;

  const totalRoomsCount = rooms.length;
  const totalBookedCount = rooms.filter((r) => r.occupied_count > 0 || r.status === "Fully Occupied").length;
  const totalVacantCount = rooms.filter((r) => r.occupied_count < r.capacity && r.status !== "Fully Occupied").length;

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
              Welcome, {ownerName || "PG Owner"}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">
              Property management overview. Click any room row below to view, edit, update, or inspect occupants in the slide-over drawer.
            </p>
          </div>
          <button
            onClick={() => navigate("/owner/add-room")}
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow"
          >
            + Add New Room
          </button>
        </div>

        {/* 3 Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Total Rooms */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Rooms</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{totalRoomsCount}</h3>
            <p className="text-xs text-slate-500 mt-2">Vacant + Occupied Rooms</p>
          </div>

          {/* Card 2: Total Booked */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <span className="text-xs font-semibold uppercase text-blue-600">Total Booked</span>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{totalBookedCount}</h3>
            <p className="text-xs text-slate-500 mt-2">Rooms Occupied by Tenants</p>
          </div>

          {/* Card 3: Total Vacant Rooms */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <span className="text-xs font-semibold uppercase text-emerald-600">Total Vacant Rooms</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalVacantCount}</h3>
            <p className="text-xs text-slate-500 mt-2">Rooms Available for Rent</p>
          </div>
        </div>

        {/* Created Rooms List Table */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Created Rooms List</h2>
              <p className="text-xs text-slate-400 font-medium">Click any room row to manage in slide-over drawer</p>
            </div>
            {rooms.length > 0 && (
              <button
                onClick={handleDeleteAllRooms}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition border border-rose-200 shadow-xs"
              >
                Delete All Rooms
              </button>
            )}
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-700">No Rooms Created Yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Click "+ Add New Room" to add rooms to your PG.</p>
              <button
                onClick={() => navigate("/owner/add-room")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm"
              >
                + Add Room Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4">Room No</th>
                      <th className="p-4">Floor</th>
                      <th className="p-4">Sharing Option</th>
                      <th className="p-4">Bed Capacity</th>
                      <th className="p-4">Price / Mo</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rooms.map((room) => (
                      <tr
                        key={room._id}
                        onClick={() => handleOpenRoomDrawer(room)}
                        className="hover:bg-blue-50/50 transition cursor-pointer group"
                      >
                        <td className="p-4 font-black text-slate-800 group-hover:text-blue-600">
                          Room {room.room_no}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          Floor {room.floor}
                        </td>
                        <td className="p-4 text-slate-700 font-semibold">
                          {room.type}
                        </td>
                        <td className="p-4 text-slate-600">
                          {room.occupied_count} / {room.capacity} Beds
                        </td>
                        <td className="p-4 font-black text-blue-600">
                          ₹{room.rent.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                              room.status === "Vacant"
                                ? "bg-emerald-100 text-emerald-800"
                                : room.status === "Fully Occupied"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition">
                            Manage Room
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer for Managing Room */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRoom ? `Room ${selectedRoom.room_no} Management` : "Manage Room"}
        subtitle="Manage specifications or view enrolled occupants list."
      >
        {selectedRoom && (
          <div className="space-y-4">
            {/* Drawer Tab Navigation */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => {
                  setEditing(false);
                  setActiveTab("details");
                }}
                className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Room Specifications
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setActiveTab("occupants");
                }}
                className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
                  activeTab === "occupants"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Occupants ({occupants.length})
              </button>
            </div>

            {/* TAB 1: Room Details */}
            {activeTab === "details" && !editing && (
              <div className="space-y-6">
                <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-100">
                  <span className="text-xs font-semibold uppercase text-blue-600">Floor {selectedRoom.floor}</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">Room {selectedRoom.room_no}</h3>
                  <div className="mt-3 text-3xl font-black text-blue-600">
                    ₹{selectedRoom.rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 text-sm">Room Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-xs text-slate-400">Room Sharing</span>
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
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((a, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow transition"
                  >
                    Edit / Update Room Details
                  </button>
                  <button
                    onClick={handleDeleteRoom}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl text-sm transition"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Occupants List */}
            {activeTab === "occupants" && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">Enrolled Occupants</h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {occupants.length} / {selectedRoom.capacity} Beds
                  </span>
                </div>

                {loadingOccupants ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading room occupants...</div>
                ) : occupants.length === 0 ? (
                  <div className="bg-slate-50 p-6 text-center rounded-xl border border-slate-200 text-xs text-slate-500">
                    No enrolled tenant occupants in Room {selectedRoom.room_no} yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {occupants.map((occ) => {
                      const tenant = occ.userDetail?.[0];
                      return (
                        <div
                          key={occ._id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-slate-800 text-sm">{tenant?.name || "Enrolled Tenant"}</h5>
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                              {occ.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 space-y-1">
                            {tenant?.email && <div>📧 {tenant.email}</div>}
                            {tenant?.phone && <div>📞 {tenant.phone}</div>}
                            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                              Allotted on: {new Date(occ.allotment_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* EDIT FORM */}
            {editing && (
              <form onSubmit={handleUpdateRoom} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Room Sharing</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Four">Four</option>
                      <option value="Five">Five</option>
                      <option value="Six">Six</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Capacity (Beds)</label>
                    <input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Price (₹ / Month)</label>
                    <input
                      type="number"
                      required
                      value={rent}
                      onChange={(e) => setRent(Number(e.target.value))}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Floor</label>
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(Number(e.target.value))}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Amenities</label>
                  <input
                    type="text"
                    value={amenitiesInput}
                    onChange={(e) => setAmenitiesInput(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm text-slate-600 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default OwnerDashboard;
