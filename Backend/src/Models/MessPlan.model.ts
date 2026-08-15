import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const messPlanSchema = new Schema({
  pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  meals_included: [{ type: String }], // e.g. ['Breakfast', 'Lunch', 'Dinner']
  timings: { type: String, required: false },
  description: { type: String, required: false },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

type MessPlan = InferSchemaType<typeof messPlanSchema>;

export default model<MessPlan>("messplan", messPlanSchema);
