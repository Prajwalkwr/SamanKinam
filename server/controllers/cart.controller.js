import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

const MAX_CART_ITEM_QTY = 20

export const addToCartItemController = async(request,response)=>{
    try {
        const  userId = request.userId
        const { productId } = request.body
        
        if(!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(productId)

        if(!product || product.publish === false || product.stock <= 0){
            return response.status(400).json({
                message : "Product is not available",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        }).populate('productId')

        if(checkItemCart){            if(checkItemCart.quantity >= MAX_CART_ITEM_QTY){
                return response.status(400).json({
                    message : `Cannot add more than ${MAX_CART_ITEM_QTY} items of this product`,
                    error : true,
                    success : false
                })
            }
            if(checkItemCart.quantity >= product.stock){
                return response.status(400).json({
                    message : `Cannot add more than available stock (${product.stock})`,
                    error : true,
                    success : false
                })
            }
            return response.status(400).json({
                message : "Item already in cart",
                error : true,
                success : false
            })
        }

        const cartItem = new CartProductModel({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        return response.json({
            data : save,
            message : "Item add successfully",
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

export const getCartItemController = async(request,response)=>{
    try {
        const userId = request.userId

        const cartItem =  await CartProductModel.find({
            userId : userId
        }).populate('productId')

        // Filter out cart items where:
        // 1. productId is null (product was deleted)
        // 2. product is not published (not available)
        // 3. product stock is 0 or negative (out of stock)
        const validCartItems = cartItem.filter(item => 
            item.productId !== null && 
            item.productId.publish === true && 
            item.productId.stock > 0
        )

        const quantityAdjustments = validCartItems.filter(item => item.quantity > item.productId.stock || item.quantity > MAX_CART_ITEM_QTY)

        if(quantityAdjustments.length > 0){
            const bulkOps = quantityAdjustments.map(item => ({
                updateOne: {
                    filter: { _id: item._id },
                    update: { quantity: Math.min(item.productId.stock, MAX_CART_ITEM_QTY) }
                }
            }))
            await CartProductModel.bulkWrite(bulkOps)

            quantityAdjustments.forEach(item => {
                item.quantity = Math.min(item.productId.stock, MAX_CART_ITEM_QTY)
            })
        }

        // Get list of unavailable items to remove them from cart
        const unavailableItems = cartItem.filter(item => 
            item.productId === null || 
            item.productId.publish === false || 
            item.productId.stock <= 0
        )

        // Remove unavailable items from cart
        if(unavailableItems.length > 0){
            const unavailableIds = unavailableItems.map(item => item._id)
            await CartProductModel.deleteMany({ _id : { $in: unavailableIds } })
        }

        return response.json({
            data : validCartItems,
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

export const updateCartItemQtyController = async(request,response)=>{
    try {
        const userId = request.userId 
        const { _id,qty } = request.body

        if(!_id || qty === undefined || qty === null){
            return response.status(400).json({
                message : "provide _id, qty",
                error : true,
                success : false
            })
        }

        const parsedQty = Number(qty)
        if(Number.isNaN(parsedQty) || parsedQty <= 0){
            return response.status(400).json({
                message : "Quantity must be a positive number",
                error : true,
                success : false
            })
        }

        if(parsedQty > MAX_CART_ITEM_QTY){
            return response.status(400).json({
                message : `Cannot set quantity higher than ${MAX_CART_ITEM_QTY}`,
                error : true,
                success : false
            })
        }

        const cartItem = await CartProductModel.findOne({
            _id : _id,
            userId : userId
        }).populate('productId')

        if(!cartItem){
            return response.status(404).json({
                message : "Cart item not found",
                error : true,
                success : false
            })
        }

        if(!cartItem.productId || cartItem.productId.publish === false || cartItem.productId.stock <= 0){
            return response.status(400).json({
                message : "Product is not available",
                error : true,
                success : false
            })
        }

        if(parsedQty > cartItem.productId.stock){
            return response.status(400).json({
                message : `Cannot set quantity higher than available stock (${cartItem.productId.stock})`,
                error : true,
                success : false
            })
        }

        cartItem.quantity = parsedQty
        await cartItem.save()

        return response.json({
            message : "Update cart",
            success : true,
            error : false, 
            data : cartItem
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(request,response)=>{
    try {
      const userId = request.userId // middleware
      const { _id } = request.body 
      
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem  = await CartProductModel.deleteOne({_id : _id, userId : userId })

      return response.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
