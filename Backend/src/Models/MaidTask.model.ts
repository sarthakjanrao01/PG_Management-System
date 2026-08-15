import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const maidTaskSchema = new Schema({
  maid_id: { type: Schema.Types.ObjectId, ref: "maid", required: true },
  pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
  task_title: { type: String, required: true },
  description: { type: String, required: false },
  assigned_date: { type: Date, required: true, default: Date.now },
  due_date: { type: Date, required: false },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  completed_at: { type: Date, required: false },
  completion_note: { type: String, required: false },
}, { timestamps: true });

type MaidTask = InferSchemaType<typeof maidTaskSchema>;

export default model<MaidTask>("maidtask", maidTaskSchema);
