import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const messEnrollmentSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "register", required: true },
  pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
  mess_plan_id: { type: Schema.Types.ObjectId, ref: "messplan", required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  payment_status: { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
  status: { type: String, enum: ["Active", "Paused", "Expired"], default: "Active" },
}, { timestamps: true });

type MessEnrollment = InferSchemaType<typeof messEnrollmentSchema>;

export default model<MessEnrollment>("messenrollment", messEnrollmentSchema);
