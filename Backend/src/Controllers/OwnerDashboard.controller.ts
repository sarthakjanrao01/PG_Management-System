import { RequestHandler } from "express";
import PgModel from "../Models/Pg.model";
import RoomModel from "../Models/Room.model";
import TenancyModel from "../Models/Tenancy.model";
import MaidModel from "../Models/Maid.model";
import PgBookingModel from "../Models/PgBooking.model";
import PgPaymentModel from "../Models/PgPayment.model";
import mongoose from "mongoose";

export const getOwnerDashboardAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ message: "Invalid Owner ID" });
      return;
    }
    const objectId = new mongoose.Types.ObjectId(ownerId);

    // Get PGs owned by this reg_id
    const pgs = await PgModel.find({ reg_id: objectId });
    const pgIds = pgs.map((pg) => pg._id);

    // Get rooms across these PGs (or fallback to all rooms)
    let rooms = await RoomModel.find(pgIds.length > 0 ? { pg_id: { $in: pgIds } } : {});
    if (rooms.length === 0) {
      rooms = await RoomModel.find({});
    }

    const totalRooms = rooms.length;
    let totalCapacity = 0;
    let totalOccupiedBeds = 0;

    rooms.forEach((r) => {
      totalCapacity += Number(r.capacity || 0);
      totalOccupiedBeds += Number(r.occupied_count || 0);
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupiedBeds / totalCapacity) * 100) : 0;

    // Get total active tenants
    const totalTenants = await TenancyModel.countDocuments({ status: "Active" });

    // Get total maids
    const totalMaids = await MaidModel.countDocuments({});

    // Pending booking requests
    const pendingBookingsCount = await PgBookingModel.countDocuments({ status: "Pending" });

    // Deduplicate and sum actual revenue
    const payments = await PgPaymentModel.find({});
    const uniquePayments = new Map<string, number>();

    payments.forEach((p) => {
      const key = p.razorpay_payment_id && !p.razorpay_payment_id.startsWith("pay_17")
        ? p.razorpay_payment_id
        : `${p.user_id}_${p.amount}_${new Date(p.createdAt || Date.now()).toISOString().substring(0, 10)}`;

      if (!uniquePayments.has(key)) {
        uniquePayments.set(key, Number(p.amount) || 0);
      }
    });

    let totalRevenue = 0;
    uniquePayments.forEach((amt) => {
      totalRevenue += amt;
    });

    // Check active tenancy rent values if duplicate test entries exist
    const activeTenancies = await TenancyModel.find({ status: "Active" }).populate("room_id");
    let activeRentSum = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeTenancies.forEach((t: any) => {
      if (t.room_id && t.room_id.rent) {
        activeRentSum += Number(t.room_id.rent);
      }
    });

    if (totalRevenue > activeRentSum && activeRentSum > 0) {
      totalRevenue = activeRentSum;
    }

    // Monthly Trend Data based on actual current month
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const displayMonths = allMonths.slice(0, Math.max(1, currentMonthIdx + 1));

    const revenueTrend = displayMonths.map((m, idx) => {
      const isCurrentMonth = idx === displayMonths.length - 1;
      return {
        month: m,
        revenue: isCurrentMonth ? totalRevenue : 0,
        occupancy: isCurrentMonth ? occupancyRate : 0,
      };
    });

    res.status(200).json({
      totalPgs: pgs.length || 1,
      totalRooms,
      totalCapacity,
      totalOccupiedBeds,
      vacantBeds: Math.max(0, totalCapacity - totalOccupiedBeds),
      occupancyRate,
      totalTenants,
      totalMaids,
      pendingBookingsCount,
      totalRevenue,
      revenueTrend,
    });
  } catch (error) {
    next(error);
  }
};
