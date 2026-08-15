import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";

interface SalaryRecord {
  _id: string;
  month: string;
  amount: number;
  paid_date: string;
  payment_method: string;
  status: string;
}

const MaidSalaryHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);

  useEffect(() => {
    const loadSalaries = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          const maidRes = await axiosInstance.get(`/maid/user/${user._id}`).catch(() => ({ data: null }));
          if (maidRes.data && maidRes.data._id) {
            const res = await axiosInstance.get(`/maid/salary/maid/${maidRes.data._id}`);
            setSalaries(res.data);
          }
        }
      } catch (err) {
        console.error("Error loading salary history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSalaries();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Salary & Payout History</h1>
        <p className="text-slate-500 text-sm mb-8">View your monthly salary payout statements recorded by the PG Owner.</p>

        {salaries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mt-3">No Salary Logs Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Once your monthly salary is paid by the owner, your salary slips will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Monthly Salary Slips</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                    <th className="p-4">Month</th>
                    <th className="p-4">Payout Date</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaries.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-800">{s.month}</td>
                      <td className="p-4 text-slate-600">{new Date(s.paid_date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-600">{s.payment_method}</td>
                      <td className="p-4 font-extrabold text-emerald-600">₹{s.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs uppercase">
                          {s.status}
                        </span>
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
  );
};

export default MaidSalaryHistory;
