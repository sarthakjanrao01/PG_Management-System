import { InferSchemaType, model, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient_id: { type: Schema.Types.ObjectId, ref: "regDetail", required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: "regDetail", required: false },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: false, default: "info" },
    isRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

type Notification = InferSchemaType<typeof notificationSchema>;

export default model<Notification>("notification", notificationSchema);
