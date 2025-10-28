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
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import { mongoDb } from "./Db/Database";

const app = express();

mongoDb();

app.use(
  cors({
    origin: ["https://management.matangievent.com"], // Add your frontend origin here
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
    ], // Adjust allowed headers if needed
  })
);

app.use(express.json());

app.use(morgan("dev"));

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
