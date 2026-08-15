import { InferSchemaType, model, Schema } from "mongoose";

const roomSchema = new Schema(
  {
    pg_id: { type: Schema.Types.ObjectId, ref: "pg", required: true },
    room_no: { type: String, required: true },
    type: { type: String, required: true },
    capacity: { type: Number, required: true, default: 1 },
    occupied_count: { type: Number, required: true, default: 0 },
    rent: { type: Number, required: true },
    floor: { type: Number, required: true, default: 1 },
    amenities: [{ type: String }],
    status: { type: String, enum: ["Vacant", "Partially Occupied", "Fully Occupied"], default: "Vacant" },
  },
  { timestamps: true }
);

type Room = InferSchemaType<typeof roomSchema>;

export default model<Room>("room", roomSchema);
