import { InferSchemaType, model, Schema } from "mongoose";

const registerSchema = new Schema({
    name : { type : String , required : true },
    mobile_number : { type : Number , required : true },
    email : { type : String , unique : true,  required : true },
    password : { type : String , required : true },
    role : { type : String , required : true },
}, {timestamps : true});

type Register = InferSchemaType<typeof registerSchema>;

export default model<Register>("register", registerSchema);