import { InferSchemaType, model, Schema } from "mongoose";

const categorySchema = new Schema({
    name : {type : String, required : true},
    isActive : {type : Boolean, required : false},
}, {timestamps : true});


type Category = InferSchemaType<typeof categorySchema>;

export default model<Category>("category", categorySchema);