import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const maidSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "register", required: true },
  owner_id: { type: Schema.Types.ObjectId, ref: "register", required: true },
  pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
  name: { type: String, required: true },
  mobile_number: { type: String, required: true },
  duty_type: { type: String, required: true }, // e.g. Cleaning, Cooking, Laundry
  salary: { type: Number, required: true },
  joining_date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

type Maid = InferSchemaType<typeof maidSchema>;

export default model<Maid>("maid", maidSchema);
