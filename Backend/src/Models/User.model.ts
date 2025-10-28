import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
    user_id : {type : Number, required : false},
    reg_id : {type : mongoose.Types.ObjectId, ref: "userDetail", required : true},
    gender : {type : String, required : true},
    profile_pic : {type : String, required : true},
    idproof_pic : {type : String, required : true},
    address : {type : String, required : true},
    street : {type : String, required : true},
    city : {type : String, required : true},
    state : {type : String, required : true},
    country : {type : String, required : true},
    pincode : {type : Number, required : true},
    isverified : {type : Boolean, required : false},
}, {timestamps : true});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("user", userSchema);