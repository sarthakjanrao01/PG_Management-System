import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";

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

const MyRoomDetails: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tenancies, setTenancies] = useState<TenancyRecord[]>([]);
  const [selectedTenancy, setSelectedTenancy] = useState<TenancyRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadMyRooms();
  }, []);

  const loadMyRooms = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        // Fetch active/enrolled tenancy records for this user
        const res = await axiosInstance.get(`/tenancy/user/${user._id}`);
        if (res.data) {
          setTenancies(Array.isArray(res.data) ? res.data : [res.data]);
        }
      }
    } catch (err) {
      console.error("Error loading enrolled rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoomDrawer = (tenancy: TenancyRecord) => {
    setSelectedTenancy(tenancy);
    setDrawerOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">My Enrolled Rooms</h1>
        <p className="text-slate-500 text-sm mb-8">
          View all rooms you are currently enrolled in. Click any room list item to open the slide-over drawer panel.
        </p>

        {tenancies.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700">No Enrolled Rooms Found</h3>
            <p className="text-sm text-slate-500 mt-1">You have not booked or enrolled in any room yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tenancies.map((t) => {
              const pg = t.pgDetail?.[0];
              const room = t.roomDetail?.[0];
              if (!room) return null;

              return (
                <div
                  key={t._id}
                  onClick={() => handleOpenRoomDrawer(t)}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {t.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Floor {room.floor}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mt-2 group-hover:text-blue-600 transition">
                      Room {room.room_no} — {pg?.name || "PG Accommodation"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pg?.address}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold uppercase text-slate-400">Monthly Rent</span>
                      <p className="text-xl font-black text-blue-600">₹{room.rent.toLocaleString()}</p>
                    </div>
                    <button className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTenancy?.roomDetail?.[0] ? `Room ${selectedTenancy.roomDetail[0].room_no}` : "Room Info"}
        subtitle="Complete details of your enrolled accommodation."
      >
        {selectedTenancy && selectedTenancy.roomDetail?.[0] && (
          <div className="space-y-6">
            <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 uppercase">Active Tenancy</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                Room {selectedTenancy.roomDetail[0].room_no}
              </h3>
              <p className="text-xs text-slate-500">{selectedTenancy.pgDetail?.[0]?.name}</p>
              <div className="mt-3 text-3xl font-black text-emerald-600">
                ₹{selectedTenancy.roomDetail[0].rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Room Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Room Sharing</span>
                  <p className="font-bold text-slate-700">{selectedTenancy.roomDetail[0].type}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Floor</span>
                  <p className="font-bold text-slate-700">Floor {selectedTenancy.roomDetail[0].floor}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Allotment Date</span>
                  <p className="font-bold text-slate-700">
                    {new Date(selectedTenancy.allotment_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">Status</span>
                  <p className="font-bold text-emerald-600">{selectedTenancy.status}</p>
                </div>
              </div>
            </div>

            {selectedTenancy.roomDetail[0].amenities?.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTenancy.roomDetail[0].amenities.map((a, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default MyRoomDetails;
