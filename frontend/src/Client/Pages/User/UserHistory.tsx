import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { axiosInstance } from "../../../Shared/Lib/axios";
import Loading from "../../../Shared/Components/Loading";
import SlideOverDrawer from "../../../Shared/Components/SlideOverDrawer";

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
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user._id);
        const res = await axiosInstance.get(`/pgpayment/user/${user._id}`).catch(() => ({ data: [] }));
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDrawer = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
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
              <td class="label">Razorpay Order ID</td>
              <td class="value">${selectedPayment.razorpay_order_id || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Payment Status</td>
              <td class="value" style="color: #16a34a;">SUCCESS / VERIFIED</td>
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
    if (!userId) return;
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-black text-rose-600 text-sm">Delete All History?</p>
        <p className="text-xs text-slate-600">Are you sure you want to delete all payment history from the database?</p>
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
                await axiosInstance.delete(`/pgpayment/user/${userId}/clear`);
                toast.success("All payment history deleted from database successfully!", { id: toastId });
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Booking & Payment History</h1>
            <p className="text-slate-500 text-sm mt-1">
              Complete log of payments made for your room bookings. Click any record to view details & print receipt PDF.
            </p>
          </div>
          {payments.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              disabled={clearing}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2.5 rounded-xl text-sm transition border border-rose-200 shadow-xs disabled:opacity-50"
            >
              {clearing ? "Deleting..." : "Clear All History"}
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700">No Payment History Found</h3>
            <p className="text-sm text-slate-500 mt-1">Once you complete room payments, your receipts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div
                key={p._id}
                onClick={() => handleOpenPaymentDrawer(p)}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Payment Confirmed
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2 group-hover:text-blue-600 transition">
                    Transaction ID: {p.razorpay_payment_id || p._id}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Order ID: {p.razorpay_order_id || "N/A"}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-semibold uppercase text-slate-400">Amount Paid</span>
                    <p className="text-xl font-black text-emerald-600">₹{(p.amount || 0).toLocaleString()}</p>
                  </div>
                  <button className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition">
                    Receipt Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-100">
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
                  <span className="font-bold text-emerald-600 uppercase">Verified</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                🖨️ Print / Save PDF Receipt
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
};

export default UserHistory;
