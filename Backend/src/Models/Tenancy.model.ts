import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const tenancySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "register", required: true },
  pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
  room_id: { type: Schema.Types.ObjectId, ref: "room", required: true },
  booking_id: { type: Schema.Types.ObjectId, ref: "pgbooking", required: false },
  allotment_date: { type: Date, required: true, default: Date.now },
  vacate_date: { type: Date, required: false },
  status: { type: String, enum: ["Active", "Notice", "Vacated"], default: "Active" },
}, { timestamps: true });

type Tenancy = InferSchemaType<typeof tenancySchema>;

export default model<Tenancy>("tenancy", tenancySchema);
