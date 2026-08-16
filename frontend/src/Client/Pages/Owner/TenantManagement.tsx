import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgsByRegisterId } from "../../../Shared/Store/PgAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import toast from "react-hot-toast";

interface PgItem {
  _id: string;
  name: string;
}

interface TenantItem {
  _id: string;
  allotment_date: string;
  status: string;
  userDetail?: { name: string; email: string; mobile_number?: number }[];
  roomDetail?: { room_no: string; type: string }[];
}

interface RoomOption {
  _id: string;
  room_no: string;
  capacity: number;
  occupied_count: number;
}

const TenantManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pgs, setPgs] = useState<PgItem[]>([]);
  const [selectedPgId, setSelectedPgId] = useState<string>("");
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [, setRooms] = useState<RoomOption[]>([]);

  useEffect(() => {
    const loadPgs = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const pgList = await fetchPgsByRegisterId(user._id);
          setPgs(pgList || []);
          if (pgList && pgList.length > 0) {
            setSelectedPgId(pgList[0]._id);
          }
        }
      } catch (err) {
        console.error("Error loading PGs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgs();
  }, []);

  useEffect(() => {
    if (selectedPgId) {
      loadTenants(selectedPgId);
      loadRooms(selectedPgId);
    }
  }, [selectedPgId]);

  const loadTenants = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/tenancy/pg/${pgId}`);
      setTenants(res.data);
    } catch (err) {
      console.error("Error loading tenants:", err);
    }
  };

  const loadRooms = async (pgId: string) => {
    try {
      const res = await axiosInstance.get(`/room/pg/${pgId}`);
      setRooms(res.data);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const handleVacate = (tenancyId: string, tenantName: string = "Tenant") => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1 font-sans">
          <p className="font-black text-rose-600 text-sm">Vacate Tenant {tenantName}?</p>
          <p className="text-xs text-slate-600">
            Are you sure you want to vacate {tenantName}? This will mark their tenancy as vacated and free up their bed capacity.
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
                const toastId = toast.loading(`Vacating ${tenantName}...`);
                try {
                  await axiosInstance.put(`/tenancy/vacate/${tenancyId}`);
                  toast.success(`Tenant ${tenantName} marked as vacated!`, { id: toastId });
                  loadTenants(selectedPgId);
                  loadRooms(selectedPgId);
                } catch (err) {
                  console.error("Error vacating tenant:", err);
                  toast.error("Failed to vacate tenant.", { id: toastId });
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

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Tenant & Allotment Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              View current occupants, room numbers, and manage vacating tenants.
            </p>
          </div>
          {pgs.length > 0 && (
            <select
              value={selectedPgId}
              onChange={(e) => setSelectedPgId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl font-medium text-sm focus:outline-none shadow-sm"
            >
              {pgs.map((pg) => (
                <option key={pg._id} value={pg._id}>
                  {pg.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tenant Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Tenant Allotment Directory</h3>
            <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              {tenants.filter((t) => t.status === "Active").length} Active Tenants
            </span>
          </div>

          {tenants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No tenants recorded for this PG yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                    <th className="p-4">Tenant Name</th>
                    <th className="p-4">Room No</th>
                    <th className="p-4">Allotment Date</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => {
                    const u = t.userDetail?.[0];
                    const r = t.roomDetail?.[0];
                    return (
                      <tr key={t._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-800">
                          {u?.name || "Tenant"}
                          <div className="text-xs font-normal text-slate-400">{u?.email}</div>
                        </td>
                        <td className="p-4 font-bold text-blue-600">
                          Room {r?.room_no || "N/A"} <span className="text-xs text-slate-400 font-normal">({r?.type})</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(t.allotment_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600">{u?.mobile_number || "N/A"}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              t.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {t.status === "Active" && (
                            <button
                              onClick={() => handleVacate(t._id, u?.name || "Tenant")}
                              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Vacate Tenant
                            </button>
                          )}
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
    </div>
  );
};

export default TenantManagement;
