import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : "category"
        }
    ]
},{
    timestamps : true
})

subCategorySchema.index({ name: 1, category: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

const SubCategoryModel = mongoose.model('subCategory',subCategorySchema)

export default SubCategoryModel