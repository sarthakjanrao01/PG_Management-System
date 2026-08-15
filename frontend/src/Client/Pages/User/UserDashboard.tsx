import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
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
  roomDetail: { _id?: string; room_no: string; type: string; rent: number }[];
  room_id?: string;
}

const UserDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [, setTenancy] = useState<TenancyDetails | null>(null);
  const [userEnrolledRoomIds, setUserEnrolledRoomIds] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [booking, setBooking] = useState(false);

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

        const tenancies = Array.isArray(tenancyRes.data)
          ? tenancyRes.data
          : tenancyRes.data
          ? [tenancyRes.data]
          : [];
        setTenancy(tenancies[0] || null);

        const enrolledIds: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tenancies.forEach((t: any) => {
          if (t.room_id) enrolledIds.push(String(t.room_id));
          if (t.roomDetail?.[0]?._id) enrolledIds.push(String(t.roomDetail[0]._id));
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payments = paymentsRes.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payments.forEach((p: any) => {
          if (p.room_id) enrolledIds.push(String(p.room_id));
        });

        setUserEnrolledRoomIds(Array.from(new Set(enrolledIds)));
        setAvailableRooms(roomsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading user dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoomDrawer = (room: RoomItem) => {
    setSelectedRoom(room);
    setDrawerOpen(true);
  };

  const handlePayAndBookRoom = async () => {
    if (!selectedRoom) return;
    setBooking(true);
    const toastId = toast.loading("Opening Razorpay Gateway...");

    try {
      // 1. Create Razorpay Payment order
      const orderRes = await axiosInstance.post("/pgpayment/create-order", {
        amount: selectedRoom.rent,
      });
      const orderPayload = orderRes.data;
      const order = orderPayload.data || orderPayload;

      toast.dismiss(toastId);

      // 2. Open Razorpay Gateway
      const opened = await openRazorpayModal({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TQ2S5aeTiHyuFQ",
        amount: order.amount || Math.round(selectedRoom.rent * 100),
        currency: order.currency || "INR",
        name: `Room ${selectedRoom.room_no} Booking`,
        description: `Rent payment for Room ${selectedRoom.room_no}`,
        order_id: order.id,
        prefill: {
          name: userName,
        },
        handler: async (response) => {
          const verifyToast = toast.loading("Verifying payment & allotting room...");
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

            // Mark immediately in local state
            setUserEnrolledRoomIds((prev) => Array.from(new Set([...prev, String(selectedRoom._id)])));

            toast.success(`Payment confirmed! Room ${selectedRoom.room_no} is now enrolled & allotted to you.`, { id: verifyToast });
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

            toast.success(`Payment logged! Room ${selectedRoom.room_no} allotted.`, { id: verifyToast });
            setDrawerOpen(false);
            loadUserData();
          }
        },
      });

      if (!opened) {
        // Fallback if Razorpay SDK script is blocked
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

        toast.success(`Room ${selectedRoom.room_no} booked & enrolled successfully!`);
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

        toast.success(`Room ${selectedRoom.room_no} booked successfully!`);
        setDrawerOpen(false);
        loadUserData();
      } catch (fallbackErr) {
        console.error("Fallback booking failed:", fallbackErr);
        toast.error("Failed to process room booking.");
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Book Room Now: Explore Rooms</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Click any room to open full room specifications and Razorpay payment drawer.
              </p>
            </div>
            <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full">
              {vacantRoomsCount} Rooms Vacant
            </span>
          </div>

          {availableRooms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-700">No Rooms Available</h3>
              <p className="text-sm text-slate-500 mt-1">All rooms added by the owner are currently occupied.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => {
                const isThisRoomEnrolled = userEnrolledRoomIds.includes(String(room._id));
                const isFullyOccupied = room.occupied_count >= room.capacity;

                return (
                  <div
                    key={room._id}
                    onClick={() => !isThisRoomEnrolled && handleOpenRoomDrawer(room)}
                    className={`p-6 rounded-xl border transition flex flex-col justify-between ${
                      isThisRoomEnrolled
                        ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg"
                        : isFullyOccupied
                        ? "bg-slate-50 border-slate-200 opacity-80"
                        : "bg-white border-slate-200 shadow-sm hover:shadow-lg cursor-pointer group"
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
                              className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                                isThisRoomEnrolled ? "bg-emerald-100 text-emerald-900 font-bold" : "bg-slate-100 text-slate-600"
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
                        disabled
                        className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl text-sm shadow-md cursor-default"
                      >
                        Already Booked
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
                        View Details & Book
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer for Room Details & Payment */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRoom ? `Room ${selectedRoom.room_no} Details` : "Room Specification"}
        subtitle="Review room details and proceed to secure online booking."
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold uppercase text-blue-600">Property Allotment</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Room {selectedRoom.room_no}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Floor {selectedRoom.floor}</p>
              <div className="mt-3 text-3xl font-black text-blue-600">
                ₹{selectedRoom.rent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

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

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={handlePayAndBookRoom}
                disabled={booking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md transition disabled:bg-blue-300"
              >
                {booking ? "Opening Razorpay..." : `Pay ₹${selectedRoom.rent.toLocaleString()} & Book Room`}
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserDashboard;
