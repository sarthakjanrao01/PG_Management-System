import { InferSchemaType, model, Schema } from "mongoose";

const subCategorySchema = new Schema({
    category_id : {type: Schema.Types.ObjectId, ref: "category", required : false},
    name : {type : String, required : true},
    description : {type : String, required : false},
    isActive : {type : Boolean, required : false},

}, {timestamps : true});

type SubCategory = InferSchemaType<typeof subCategorySchema>;


export default model<SubCategory>("subcategory", subCategorySchema);