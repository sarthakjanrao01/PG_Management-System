import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgsByRegisterId } from "../../../Shared/Store/PgAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface PgItem {
  _id: string;
  name: string;
  address: string;
}

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

const RoomManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string>("");
  const [pgs, setPgs] = useState<PgItem[]>([]);
  const [selectedPgId, setSelectedPgId] = useState<string>("");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [roomNo, setRoomNo] = useState("");
  const [type, setType] = useState("Single");
  const [capacity, setCapacity] = useState(1);
  const [rent, setRent] = useState(5000);
  const [floor, setFloor] = useState(1);
  const [amenitiesInput, setAmenitiesInput] = useState("AC, WiFi, Attached Bath");

  useEffect(() => {
    const loadOwnerPgs = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          setOwnerId(user._id);
          const pgList = await fetchPgsByRegisterId(user._id);
          setPgs(pgList || []);
          if (pgList && pgList.length > 0) {
            setSelectedPgId(pgList[0]._id);
            loadRooms(pgList[0]._id);
          } else {
            loadRooms("all");
          }
        }
      } catch (err) {
        console.error("Error loading PGs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOwnerPgs();
  }, []);

  const loadRooms = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/room/pg/${pgId || "all"}`);
      setRooms(res.data || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo || !rent) {
      alert("Please provide a room number and rent amount.");
      return;
    }
    setSubmitting(true);
    try {
      const amenitiesArr = amenitiesInput.split(",").map((s) => s.trim()).filter(Boolean);
      await axiosInstance.post("/room/add", {
        owner_id: ownerId,
        pg_id: selectedPgId,
        room_no: roomNo,
        type,
        capacity: Number(capacity),
        rent: Number(rent),
        floor: Number(floor),
        amenities: amenitiesArr,
      });

      alert(`Room ${roomNo} added successfully! Available for booking.`);
      setShowAddModal(false);
      setRoomNo("");
      loadRooms(selectedPgId || "all");
    } catch (err) {
      console.error("Error adding room:", err);
      alert("Failed to save room. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await axiosInstance.delete(`/room/${id}`);
      loadRooms(selectedPgId || "all");
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Room Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Add rooms, set capacity, rent prices, and publish available rooms for tenants to book.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {pgs.length > 0 && (
              <select
                value={selectedPgId}
                onChange={(e) => {
                  setSelectedPgId(e.target.value);
                  loadRooms(e.target.value);
                }}
                className="bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl font-medium text-sm focus:outline-none shadow-sm"
              >
                {pgs.map((pg) => (
                  <option key={pg._id} value={pg._id}>
                    {pg.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow transition"
            >
              + Add Room
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mt-3">No Rooms Created Yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Click "+ Add Room" to add available rooms to your PG.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold"
            >
              + Add Room Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Floor {room.floor}
                      </span>
                      <h3 className="text-xl font-black text-slate-800">Room {room.room_no}</h3>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                        room.status === "Vacant"
                          ? "bg-emerald-100 text-emerald-700"
                          : room.status === "Fully Occupied"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Room Type:</span>
                      <span className="font-semibold text-slate-700">{room.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="font-semibold text-slate-700">
                        {room.occupied_count} / {room.capacity} Beds
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price per Bed:</span>
                      <span className="font-bold text-blue-600 text-base">₹{room.rent.toLocaleString()} / month</span>
                    </div>
                  </div>

                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {room.amenities.map((a, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Room Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Dormitory">Dormitory</option>
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
                  <label className="text-xs font-semibold text-slate-600 uppercase">Price / Rent (₹ / Month)</label>
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
                <label className="text-xs font-semibold text-slate-600 uppercase">Amenities (Comma separated)</label>
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:bg-blue-300"
                >
                  {submitting ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
