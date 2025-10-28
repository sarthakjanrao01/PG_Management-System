import { InferSchemaType, model, Schema } from "mongoose";

const pgTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, required: false },
  },
  { timestamps: true }
);

type PgType = InferSchemaType<typeof pgTypeSchema>;

export default model<PgType>("pgtype", pgTypeSchema);
