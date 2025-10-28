import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const serviceSchema = new Schema({
    provider_id : {type : mongoose.Types.ObjectId, ref: "serviceprovider", required : true},
    category_id : {type : mongoose.Types.ObjectId, ref:"category", required : true},
    sub_category_id : {type : mongoose.Types.ObjectId, ref:"subcategory", required : true},
    price : {type : Number, required : true},
    note : {type : String, required : false},
    isActive : {type : Boolean, required : false},
}, {timestamps : true});

type Service = InferSchemaType<typeof serviceSchema>;

export default model<Service>("service", serviceSchema);