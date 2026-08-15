import { InferSchemaType, model, Schema } from "mongoose";

const complaintSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "register", required: true },
    pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: false },
    room_id: { type: Schema.Types.ObjectId, ref: "room", required: false },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assigned_maid_id: { type: Schema.Types.ObjectId, ref: "maid", required: false },
    status: { type: String, enum: ["Open", "In Progress", "Accepted", "Resolved"], default: "Open" },
    user_reviewed: { type: Boolean, default: false },
    resolution_note: { type: String, required: false },
  },
  { timestamps: true }
);

type Complaint = InferSchemaType<typeof complaintSchema>;

export default model<Complaint>("complaint", complaintSchema);
