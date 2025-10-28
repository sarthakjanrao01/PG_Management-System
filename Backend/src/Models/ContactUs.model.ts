import { InferSchemaType, model, Schema } from "mongoose";

const ContactUsSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

type ContactUs = InferSchemaType<typeof ContactUsSchema>;

export default model<ContactUs>("contactus", ContactUsSchema);