import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import registerRoutes from "./Routes/Register.route";
import userRoutes from "./Routes/User.route";
import categoryRoutes from "./Routes/Category.route";
import subCategoryRoutes from "./Routes/SubCategory.route";
import bookingRoutes from "./Routes/Booking.route";
import pgBookingRoutes from "./Routes/PgBooking.route";
import serviceRoutes from "./Routes/Service.route";
import pgTypeRoutes from "./Routes/PgType.route";
import pgRoutes from "./Routes/Pg.route";
import adminRoutes from "./Routes/Admin.route";
import pgPaymentRoutes from "./Routes/PgPayment.route";
import contactUsRoutes from "./Routes/ContactUs.route";
import roomRoutes from "./Routes/Room.route";
import tenancyRoutes from "./Routes/Tenancy.route";
import messRoutes from "./Routes/Mess.route";
import maidRoutes from "./Routes/Maid.route";
import complaintRoutes from "./Routes/Complaint.route";
import ownerDashboardRoutes from "./Routes/OwnerDashboard.route";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import { mongoDb } from "./Db/Database";

const app = express();

mongoDb();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://management.matangievent.com",
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(",").forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Date",
      "X-Api-Version",
    ],
  })
);

app.use(express.json());

app.use(morgan("dev"));

import notificationRoutes from "./Routes/Notification.route";

app.use("/api/register", registerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/pgbooking", pgBookingRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/pgtype", pgTypeRoutes);
app.use("/api/pg", pgRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pgpayment", pgPaymentRoutes);
app.use("/api/contactus", contactUsRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/tenancy", tenancyRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/maid", maidRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/owner", ownerDashboardRoutes);
app.use("/api/notification", notificationRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "EndPoint Not Found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "Error occurred while fetching data";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.statusCode;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
