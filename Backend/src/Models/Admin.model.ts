import { InferSchemaType, model, Schema } from "mongoose";

const AdminSchema = new Schema({
    name : {type : String, required : true},
    email : {type : String, required : true},
    password : {type : String, required : true},
    role : {type : String, required : true},
    isActive : {type : Boolean, required : false},
}, {timestamps : true
});

type Admin = InferSchemaType<typeof AdminSchema>;

export default model<Admin>("admin", AdminSchema);