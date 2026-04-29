import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const AddCategoryController = async(request,response)=>{
    try {
        const { name , image } = request.body 

        if(!name || !image){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const normalizedName = name.trim()
        const duplicateCategory = await CategoryModel.findOne({
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
        })

        if (duplicateCategory) {
            return response.status(400).json({
                message: "Category with this name already exists",
                error: true,
                success: false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return response.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Add Category",
            data : saveCategory,
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

const defaultCategories = [
    { name: 'Atta, Rice & Dal', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725888087/binkeyit/rqs2ac9wwpdkcbzd7om6.png' },
    { name: 'Baby Care', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725882539/binkeyit/xgw4tbydzhakirfzm8fo.png' },
    { name: 'Bakery & Biscuits', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725882610/binkeyit/uz3opyestu20xwosazao.png' },
    { name: 'Breakfast & Instant Food', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725883962/binkeyit/npxpsdy0ratuttkvx18g.png' },
    { name: 'Chicken, Meat & Fish', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725883978/binkeyit/rtsb0kkfafhhycspb4d4.png' },
    { name: 'Cleaning Essentials', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955270/binkeyit/omc8nnhamvbccqeu7pdk.png' },
    { name: 'Cold Drinks & Juices', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955285/binkeyit/arbeviqib8aq8zhfhn1e.png' },
    { name: 'Dairy, Bread & Eggs', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955298/binkeyit/qac2jr23yg1ci4ayuxp2.png' },
    { name: 'Fruits & Vegetables', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955316/binkeyit/lmvmyyjdm6vdgwhqazve.png' },
    { name: 'Home & Office', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955332/binkeyit/cu8vuutqxqecw9zzq16c.png' },
    { name: 'Masala, Oil & More', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955345/binkeyit/zbuwc8rsfpsynbuxhjww.png' },
    { name: 'Organic & Healthy Living', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955359/binkeyit/ffe08r08hzochuxguaoo.png' },
    { name: 'Personal Care', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955401/binkeyit/fce1p10lpskkvqduvn44.png' },
    { name: 'Pet Care', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955422/binkeyit/uw0sexbgyjyttv5gmm0l.png' },
    { name: 'Pharma & Wellness', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955434/binkeyit/o9lsnshrzq5pfgtmnaay.png' },
    { name: 'Sauces & Spreads', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955446/binkeyit/nvs1gwzo5tlptcu4ghet.png' },
    { name: 'Snacks & Munchies', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955459/binkeyit/lx9a2ktgjscrhapdd8sy.png' },
    { name: 'Sweet Tooth', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955471/binkeyit/gcoussznta0gjo0xjyiw.png' },
    { name: 'Rakhi', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955471/binkeyit/gcoussznta0gjo0xjyiw.png' },
    { name: 'Festival Sweets', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955471/binkeyit/gcoussznta0gjo0xjyiw.png' },
    { name: 'Gifts & Hampers', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955471/binkeyit/gcoussznta0gjo0xjyiw.png' },
    { name: 'Tea, Coffe & Health Drink', image: 'http://res.cloudinary.com/dljwfy0pe/image/upload/v1725955482/binkeyit/jclivpy8oq8sdsjjk07p.png' }
]

export const getCategoryController = async(request,response)=>{
    try {
        let data = await CategoryModel.find().sort({ createdAt : -1 })

        if (data.length === 0) {
            data = await CategoryModel.insertMany(defaultCategories)
        }

        return response.json({
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

export const updateCategoryController = async(request,response)=>{
    try {
        const { _id ,name, image } = request.body 

        if (name) {
            const normalizedName = name.trim()
            const duplicateCategory = await CategoryModel.findOne({
                _id: { $ne: _id },
                name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" }
            })

            if (duplicateCategory) {
                return response.status(400).json({
                    message: "Category with this name already exists",
                    error: true,
                    success: false
                })
            }
        }

        const update = await CategoryModel.updateOne({
            _id : _id
        },{
           name, 
           image 
        })

        return response.json({
            message : "Updated Category",
            success : true,
            error : false,
            data : update
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 

        if (!_id) {
            return response.status(400).json({
                message : "Provide category _id",
                error : true,
                success : false
            })
        }

        const checkSubCategory = await SubCategoryModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        const checkProduct = await ProductModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        if (checkProduct > 0) {
            await ProductModel.deleteMany({
                category : {
                    "$in" : [ _id ]
                }
            })
        }

        if (checkSubCategory > 0) {
            await SubCategoryModel.deleteMany({
                category : {
                    "$in" : [ _id ]
                }
            })
        }

        const deleteCategory = await CategoryModel.deleteOne({ _id : _id})

        return response.json({
            message : "Category deleted successfully",
            data : deleteCategory,
            error : false,
            success : true
        })

    } catch (error) {
       return response.status(500).json({
            message : error.message || error,
            success : false,
            error : true
       }) 
    }
}