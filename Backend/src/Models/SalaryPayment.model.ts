import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const salaryPaymentSchema = new Schema({
  maid_id: { type: Schema.Types.ObjectId, ref: "maid", required: true },
  month: { type: String, required: true }, // e.g. "2026-08"
  amount: { type: Number, required: true },
  paid_date: { type: Date, required: true, default: Date.now },
  payment_method: { type: String, default: "Cash/Bank Transfer" },
  status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
}, { timestamps: true });

type SalaryPayment = InferSchemaType<typeof salaryPaymentSchema>;

export default model<SalaryPayment>("salarypayment", salaryPaymentSchema);
