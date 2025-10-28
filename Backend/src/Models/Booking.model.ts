import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const bookingSchema = new Schema({
    user_id : {type : mongoose.Types.ObjectId, ref:"userDetail", required : true},
    provider_id : {type : mongoose.Types.ObjectId, ref:"providerDetail", required : false},
    name: {type : String, required : true},
    gender : {type : String, required : false},
    category_id : {type : mongoose.Types.ObjectId, ref:"cateogry", required : true},
    sub_category_id : {type : mongoose.Types.ObjectId, ref:"subcategory", required : true},
    start_date : {type : Date, required : true},
    status : {type: String, required : false},
}, {timestamps : true});

type Booking = InferSchemaType<typeof bookingSchema>;

export default model<Booking>("booking", bookingSchema);