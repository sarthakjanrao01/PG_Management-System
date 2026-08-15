import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const maidAttendanceSchema = new Schema({
  maid_id: { type: Schema.Types.ObjectId, ref: "maid", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
  note: { type: String, required: false },
}, { timestamps: true });

type MaidAttendance = InferSchemaType<typeof maidAttendanceSchema>;

export default model<MaidAttendance>("maidattendance", maidAttendanceSchema);
