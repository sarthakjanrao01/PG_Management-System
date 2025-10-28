import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const pgBookingSchema = new Schema({
    user_id : {type : mongoose.Types.ObjectId, ref:"userDetail", required : true},
    pgowner_id : {type : mongoose.Types.ObjectId, ref:"pgowner", required : true},
    pg_id : {type : mongoose.Types.ObjectId, ref:"pg", required : true},
    name: {type : String, required : true},
    gender : {type : String, required : false},
    start_date : {type : Date, required : true},
    status : {type: String, required : false},
    payment_status : {type: String, required : true},
}, {timestamps : true});

type PgBooking = InferSchemaType<typeof pgBookingSchema>;

export default model<PgBooking>("pgbooking", pgBookingSchema);