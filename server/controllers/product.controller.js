import ProductModel from "../models/product.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            costPrice,
            discount,
            description,
            more_details,
        } = request.body 

        const categoryIds = Array.isArray(category)
          ? category.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
          : []
        const subCategoryIds = Array.isArray(subCategory)
          ? subCategory.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
          : []

        if(!name || !image?.[0] || !categoryIds[0] || !subCategoryIds[0] || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const normalizedName = name.trim()
        const duplicateProduct = await ProductModel.findOne({
            _id: { $ne: null },
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
        })

        if (duplicateProduct) {
            return response.status(400).json({
                message: "Product with this name already exists",
                error: true,
                success: false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            category: categoryIds,
            subCategory: subCategoryIds,
            unit,
            stock,
            price,
            costPrice,
            discount,
            description,
            more_details,
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({
                message: "Product with this name already exists",
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

export const getProductController = async(request,response)=>{
    try {
        
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = search ? {
            $text : {
                $search : search
            },
            publish : true
        } : {
            publish : true
        }

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in: [id] },
            publish : true
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
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

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in: [categoryId] },
            subCategory : { $in: [subCategoryId] },
            publish : true
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        const product = await ProductModel.findOne({ _id : productId })


        return response.json({
            message : "product details",
            data : product,
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

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id, name, category, subCategory } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const existingProduct = await ProductModel.findById(_id)
        if (!existingProduct) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }

        const categoryIds = category
          ? (Array.isArray(category)
              ? category.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
              : [category])
          : existingProduct.category
        const subCategoryIds = subCategory
          ? (Array.isArray(subCategory)
              ? subCategory.map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean)
              : [subCategory])
          : existingProduct.subCategory

        const nameToCheck = name ? name.trim() : existingProduct.name

        const duplicateProduct = await ProductModel.findOne({
            _id: { $ne: _id },
            name: { $regex: `^${escapeRegex(nameToCheck)}$`, $options: "i" }
        })

        if (duplicateProduct) {
            return response.status(400).json({
                message: "Product with this name already exists",
                error: true,
                success: false
            })
        }

        const updatePayload = {
          ...request.body,
          ...(category ? { category: categoryIds } : {}),
          ...(subCategory ? { subCategory: subCategoryIds } : {})
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id }, updatePayload)

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({
                message: "Product with this name already exists",
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

export const getProductSummary = async(request,response)=>{
    try {
        const [totalProducts, totalStockResult, outOfStockCount, lowStockCount] = await Promise.all([
            ProductModel.countDocuments({}),
            ProductModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: { $cond: [{ $gt: ["$stock", 0] }, "$stock", 0] } }
                    }
                }
            ]),
            ProductModel.countDocuments({ $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }] }),
            ProductModel.countDocuments({ stock: { $gt: 0, $lte: 5 } })
        ])

        const totalStock = totalStockResult?.[0]?.totalStock || 0

        return response.json({
            message: "Product inventory summary",
            data: {
                totalProducts,
                totalStock,
                outOfStockCount,
                lowStockCount
            },
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.findByIdAndDelete(_id)

        if (!deleteProduct) {
            return response.status(404).json({
                message : "Product not found",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page , limit } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        const escapeRegex = (value = '') => {
            return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }

        const query = search ? {
            publish : true,
            $or: [
                { name: { $regex: escapeRegex(search), $options: 'i' } },
                { description: { $regex: escapeRegex(search), $options: 'i' } }
            ]
        } : {
            publish : true
        }

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}