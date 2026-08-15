import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../../../Shared/Lib/axios";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";

const AddRoomOwner: React.FC = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [roomNo, setRoomNo] = useState("");
  const [floor, setFloor] = useState<number | string>(1);
  const [type, setType] = useState("Single");
  const [rent, setRent] = useState<number | string>("");

  useEffect(() => {
    getLoggedInUser().then((user) => {
      if (user) setOwnerId(user._id);
    });
  }, []);

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericRent = Number(rent);
    if (!roomNo || isNaN(numericRent) || numericRent <= 0) {
      toast.error("Please fill in a valid Room Number and Rent Price.");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Creating room...");

    try {
      let capacity = 1;
      if (type === "Double") capacity = 2;
      else if (type === "Triple") capacity = 3;
      else if (type === "Four") capacity = 4;
      else if (type === "Five") capacity = 5;
      else if (type === "Six") capacity = 6;

      await axiosInstance.post("/room/create", {
        room_no: roomNo,
        floor: Number(floor) || 1,
        type,
        capacity,
        rent: numericRent,
        owner_id: ownerId,
        amenities: ["AC", "WiFi", "Attached Bath"],
      });

      toast.success(`Room ${roomNo} added successfully! Prospective tenants can now book this room.`, { id: toastId });
      navigate("/owner/dashboard");
    } catch (err) {
      console.error("Error adding room:", err);
      toast.error("Failed to create room. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800">Add New Room</h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter room number, floor, room sharing type, and monthly rent price to publish the room.
            </p>
          </div>

          <form onSubmit={handleAddRoomSubmit} className="p-6 space-y-6">
            {/* Field 1: Room Number */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Room Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101, 202, 305"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full mt-1.5 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Field 2: Floor Number */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Floor Number
              </label>
              <input
                type="number"
                required
                min={0}
                value={floor}
                onChange={(e) => setFloor(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full mt-1.5 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Field 3: Room Sharing */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Room Sharing Option
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1.5 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="Single">Single (1 Bed)</option>
                <option value="Double">Double (2 Beds)</option>
                <option value="Triple">Triple (3 Beds)</option>
                <option value="Four">Four (4 Beds)</option>
                <option value="Five">Five (5 Beds)</option>
                <option value="Six">Six (6 Beds)</option>
              </select>
            </div>

            {/* Field 4: Price / Rent */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Rent Price (₹ / Month)
              </label>
              <input
                type="number"
                required
                placeholder="Enter any price (e.g. 3500, 12000)"
                value={rent}
                onChange={(e) => setRent(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full mt-1.5 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-600"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/owner/dashboard")}
                className="px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-sm transition shadow-md disabled:bg-blue-300"
              >
                {submitting ? "Adding Room..." : "Submit Room"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoomOwner;
