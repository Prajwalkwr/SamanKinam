import SubCategoryModel from "../models/subCategory.model.js";import ProductModel from "../models/product.model.js";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const AddSubCategoryController = async(request,response)=>{
    try {
        const { name, image, category } = request.body 

        if(!name || !image || !category?.[0] ){
            return response.status(400).json({
                message : "Provide name, image, category",
                error : true,
                success : false
            })
        }

        const categoryIds = Array.isArray(category)
            ? [...new Set(category.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean))]
            : []

        if (!categoryIds[0]) {
            return response.status(400).json({
                message: "Provide name, image, category",
                error: true,
                success: false
            })
        }

        const normalizedName = name.trim()
        const duplicateSubCategory = await SubCategoryModel.findOne({
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
            category: { $in: categoryIds }
        })

        if (duplicateSubCategory) {
            return response.status(400).json({
                message: "Subcategory with this name already exists for this category",
                error: true,
                success: false
            })
        }

        const payload = {
            name,
            image,
            category: categoryIds
        }

        const createSubCategory = new SubCategoryModel(payload)
        const save = await createSubCategory.save()

        return response.json({
            message : "Sub Category Created",
            data : save,
            error : false,
            success : true
        })

    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({
                message: "Subcategory with this name already exists for this category",
                error: true,
                success: false
            })
        }
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getSubCategoryController = async(request,response)=>{
    try {
        const data = await SubCategoryModel.find().sort({createdAt : -1}).populate('category')
        return response.json({
            message : "Sub Category data",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateSubCategoryController = async(request,response)=>{
    try {
        const { _id, name, image, category } = request.body 

        const checkSub = await SubCategoryModel.findById(_id)

        if(!checkSub){
            return response.status(400).json({
                message : "Check your _id",
                error : true,
                success : false
            })
        }

        const categoryIds = category
          ? [...new Set(
              Array.isArray(category)
                ? category.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
                : [category]
            )]
          : checkSub.category

        const nameToCheck = name ? name.trim() : checkSub.name

        const duplicateSubCategory = await SubCategoryModel.findOne({
            _id: { $ne: _id },
            name: { $regex: `^${escapeRegex(nameToCheck)}$`, $options: "i" },
            category: { $in: categoryIds }
        })

        if (duplicateSubCategory) {
            return response.status(400).json({
                message: "Subcategory with this name already exists for this category",
                error: true,
                success: false
            })
        }

        const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(_id,{
            name,
            image,
            category: categoryIds
        })

        return response.json({
            message : 'Updated Successfully',
            data : updateSubCategory,
            error : false,
            success : true
        })

    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({
                message: "Subcategory with this name already exists for this category",
                error: true,
                success: false
            })
        }
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false 
        })
    }
}

export const deleteSubCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 

        if (!_id) {
            return response.status(400).json({
                message : "Provide subcategory _id",
                error : true,
                success : false
            })
        }

        const linkedProducts = await ProductModel.countDocuments({
            subCategory : { $in : [_id] }
        })

        if (linkedProducts > 0) {
            await ProductModel.deleteMany({
                subCategory : { $in : [_id] }
            })
        }

        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id)

        if (!deleteSub) {
            return response.status(404).json({
                message : "Subcategory not found",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Subcategory deleted successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}