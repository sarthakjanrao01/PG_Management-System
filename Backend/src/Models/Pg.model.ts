import { InferSchemaType, model, Schema } from "mongoose";

const pgSchema = new Schema({
    reg_id: { type: Schema.Types.ObjectId, ref: "regDetail", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    sub_category_id: { type: Schema.Types.ObjectId, ref: "sub_category", required: true },
    type_id: { type: Schema.Types.ObjectId, ref: "type", required: true },
    address: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    image1 : { type: String, required: false },
    image2 : { type: String, required: false },
    image3 : { type: String, required: false },
    image4 : { type: String, required: false },
    image5 : { type: String, required: false },
    status: { type: String, required: false },
    isVerified: { type: Boolean, required: false },
}, {timestamps: true});

type Pg = InferSchemaType<typeof pgSchema>;

export default model<Pg>("pg", pgSchema);