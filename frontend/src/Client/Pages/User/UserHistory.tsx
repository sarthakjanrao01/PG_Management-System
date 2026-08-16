import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";
import { FiSearch, FiPrinter, FiTrash2 } from "react-icons/fi";

interface PaymentRecord {
  _id: string;
  amount: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  createdAt: string;
}

const UserHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user._id);
        const role = (user.role || "").toLowerCase();
        if (role === "superadmin") {
          setIsSuperAdmin(true);
          const res = await axiosInstance.get("/pgpayment/all").catch(() => ({ data: [] }));
          setPayments(res.data || []);
        } else {
          setIsSuperAdmin(false);
          const res = await axiosInstance.get(`/pgpayment/user/${user._id}`).catch(() => ({ data: [] }));
          setPayments(res.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;
      const payId = (p.razorpay_payment_id || p._id).toLowerCase();
      const orderId = (p.razorpay_order_id || "").toLowerCase();
      return payId.includes(query) || orderId.includes(query);
    });
  }, [payments, searchTerm]);

  const handleOpenPaymentDrawer = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  const handleDeleteSinglePayment = async (paymentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const toastId = toast.loading("Deleting payment record...");
    try {
      await axiosInstance.delete(`/pgpayment/${paymentId}`);
      toast.success("Payment record deleted successfully!", { id: toastId });
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Error deleting payment record:", err);
      toast.error("Failed to delete payment record.", { id: toastId });
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedPayment) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popup windows to print or save PDF receipt.");
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${selectedPayment.razorpay_payment_id || selectedPayment._id}</title>
          <style>
            body { font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
            .title { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
            .amount-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 25px; }
            .amount { font-size: 32px; font-weight: 900; color: #16a34a; }
            .status { background-color: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 10px; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            .details-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .details-table td.label { color: #64748b; font-weight: 500; }
            .details-table td.value { font-weight: 700; color: #0f172a; text-align: right; font-family: monospace; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">PG Management System</h1>
            <p class="subtitle">Official Online Accommodation Payment Receipt</p>
          </div>
          <div class="amount-box">
            <span class="status">✓ Payment Verified</span>
            <div class="amount">₹${(selectedPayment.amount || 0).toLocaleString()}</div>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Paid on ${new Date(selectedPayment.createdAt).toLocaleString()}</p>
          </div>
          <table class="details-table">
            <tr>
              <td class="label">Transaction / Payment ID</td>
              <td class="value">${selectedPayment.razorpay_payment_id || selectedPayment._id}</td>
            </tr>
            <tr>
              <td class="label">Order ID</td>
              <td class="value">${selectedPayment.razorpay_order_id || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Amount Paid</td>
              <td class="value">₹${(selectedPayment.amount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="label">Payment Date & Time</td>
              <td class="value" style="font-family: inherit;">${new Date(selectedPayment.createdAt).toLocaleString()}</td>
            </tr>
          </table>
          <div class="footer">
            <p>Thank you for your payment! This is an official system-generated receipt.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleClearAllHistory = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 font-sans">
        <p className="font-black text-rose-600 text-sm">Clear All Payment History?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete payment history from the database?</p>
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
              const toastId = toast.loading("Clearing payment history...");
              try {
                if (isSuperAdmin) {
                  await axiosInstance.delete("/pgpayment/clear-all");
                } else {
                  await axiosInstance.delete(`/pgpayment/user/${userId}/clear`);
                }
                toast.success("Payment history cleared successfully!", { id: toastId });
                setPayments([]);
                setDrawerOpen(false);
              } catch (err) {
                console.error("Error deleting payment history:", err);
                toast.error("Failed to delete payment history.", { id: toastId });
              } finally {
                setClearing(false);
              }
            }}
            className="px-3 py-1.5 text-xs bg-rose-600 font-bold rounded-lg text-white"
          >
            Confirm Clear
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isSuperAdmin ? "System Payments Log (Super Admin)" : "Booking & Payment History"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isSuperAdmin
                ? "Global log of all room booking payments across all properties. Click any record to manage or print PDF."
                : "Complete log of payments made for your room bookings. Click any record to view details & print receipt PDF."}
            </p>
          </div>
          {payments.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              disabled={clearing}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition border border-rose-200 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <FiTrash2 />
              {clearing ? "Deleting..." : "Clear All History"}
            </button>
          )}
        </div>

        {/* Search Input Toolbar */}
        {payments.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-4 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transaction ID or order ID..."
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

        {/* Classic Clean Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <h3 className="text-base font-bold text-slate-700">No Payment History Found</h3>
              <p className="text-xs text-slate-500 mt-1">Once room payments are recorded, receipts will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Transaction / Payment ID</th>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Payment Date</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr
                      key={p._id}
                      onClick={() => handleOpenPaymentDrawer(p)}
                      className="hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5 font-mono text-xs font-bold text-slate-800 group-hover:text-purple-600 transition">
                        {p.razorpay_payment_id || p._id}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-slate-500">
                        {p.razorpay_order_id || "N/A"}
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        ₹{(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Confirmed
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPaymentDrawer(p)}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition"
                          >
                            Receipt Details
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={(e) => handleDeleteSinglePayment(p._id, e)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Slide-Over Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Payment Receipt Details"
        subtitle="Official Razorpay payment confirmation record."
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 uppercase">Successful Transaction</span>
              <div className="mt-2 text-3xl font-black text-emerald-600">
                ₹{(selectedPayment.amount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Paid on {new Date(selectedPayment.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm">Payment Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Razorpay Payment ID</span>
                  <span className="font-mono font-bold text-slate-700">{selectedPayment.razorpay_payment_id || "N/A"}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Razorpay Order ID</span>
                  <span className="font-mono font-bold text-slate-700">{selectedPayment.razorpay_order_id || "N/A"}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-emerald-600 uppercase">Verified & Paid</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow transition flex items-center justify-center gap-2"
              >
                <FiPrinter className="text-base" />
                Print / Save PDF Receipt
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => handleDeleteSinglePayment(selectedPayment._id)}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs transition border border-rose-200 flex items-center justify-center gap-1.5"
                >
                  <FiTrash2 />
                  Delete Payment Record from Database
                </button>
              )}
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserHistory;
