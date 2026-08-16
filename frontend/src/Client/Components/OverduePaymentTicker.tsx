import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface OverduePaymentTickerProps {
  roomNo: string;
  rentAmount: number;
  startDateStr?: string;
  endDateStr?: string;
  overdueDays?: number;
  onPayNow: () => void;
}

const OverduePaymentTicker: React.FC<OverduePaymentTickerProps> = ({
  roomNo,
  rentAmount,
  startDateStr,
  endDateStr,
  overdueDays = 1,
  onPayNow,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md font-sans border-b border-amber-600 overflow-hidden relative group py-2.5 px-4 mb-6 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Ticker Content */}
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <div className="flex items-center gap-1.5 shrink-0 bg-black/20 text-amber-100 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            <FiAlertTriangle className="animate-bounce text-amber-200" />
            <span>Overdue Living Warning</span>
          </div>

          <div className="overflow-hidden w-full">
            <p className="text-xs sm:text-sm font-black whitespace-nowrap animate-marquee">
              Your living period ({startDateStr || "Previous Month"} – {endDateStr || "Current Due"}) for <span className="underline">Room {roomNo}</span> has expired! ({overdueDays} Day{overdueDays > 1 ? "s" : ""} Extra Living). Rent payment of ₹{rentAmount.toLocaleString()} is remaining for the new cycle. Complete payment fast to keep your room active.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onPayNow}
          className="shrink-0 bg-white hover:bg-amber-50 text-amber-950 font-black text-xs px-4 py-2 rounded-lg shadow-sm transition transform active:scale-95 hover:scale-105 cursor-pointer"
        >
          Pay ₹{rentAmount.toLocaleString()} Now
        </button>
      </div>
    </div>
  );
};

export default OverduePaymentTicker;
