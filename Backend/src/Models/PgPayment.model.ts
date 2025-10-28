import { InferSchemaType, model, Schema } from "mongoose";

const pgPaymentSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "userDetail", required: true },
    pg_id: { type: Schema.Types.ObjectId, ref: "pgDetail", required: true },
    razorpay_order_id : {type : String, required : true},
    razorpay_payment_id : {type : String, required : true},
    razorpay_signature : {type : String, required : true},
}, {timestamps : true});


type PgPayment = InferSchemaType<typeof pgPaymentSchema>;

export default model<PgPayment>("pgpayment", pgPaymentSchema);