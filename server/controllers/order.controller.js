import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import AddressModel from "../models/address.model.js";
import mongoose from "mongoose";
import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

const MAX_ORDER_ITEM_QTY = 20

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 
        const invoiceId = `INV-${new mongoose.Types.ObjectId()}`

        // Validate that all items are still available and within the per-item order limit
        const unavailableItems = []
        const quantityLimitItems = []
        for(const item of list_items){
            const product = await ProductModel.findById(item.productId._id)
            if(!product || product.publish === false || product.stock <= 0){
                unavailableItems.push({
                    name: item.productId.name,
                    reason: !product ? 'Product deleted' : product.publish === false ? 'Product unavailable' : 'Out of stock'
                })
            }
            if(Number(item.quantity || 0) > MAX_ORDER_ITEM_QTY){
                quantityLimitItems.push({
                    name: item.productId.name,
                    quantity: Number(item.quantity || 0),
                    limit: MAX_ORDER_ITEM_QTY
                })
            }
        }

        if(quantityLimitItems.length > 0){
            return response.status(400).json({
                message : `Some items exceed the maximum allowed quantity of ${MAX_ORDER_ITEM_QTY}`,
                error : true,
                success : false,
                quantityLimitItems
            })
        }

        // If any items are unavailable, return error
        if(unavailableItems.length > 0){
            return response.status(400).json({
                message : "Some items are no longer available",
                error : true,
                success : false,
                unavailableItems : unavailableItems
            })
        }

        const payload = list_items.map(el => {
            const unitPrice = pricewithDiscount(el.productId.price, el.productId.discount)
            const itemTotal = unitPrice * Number(el.quantity || 1)

            return({
                userId : userId,
                invoiceId : invoiceId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                quantity : el.quantity || 1,
                unitPrice,
                costPrice: Number(el.productId.costPrice || 0),
                paymentId : "",
                payment_status : "COD",
                delivery_address : addressId ,
                subTotalAmt  : itemTotal,
                totalAmt  :  itemTotal,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        ///reduce stock
        for(const item of list_items){
            await ProductModel.findByIdAndUpdate(item.productId._id, {
                $inc: { stock: -item.quantity }
            })
        }

        // Send invoice email to customer
        if (generatedOrder && generatedOrder.length > 0) {
            await sendInvoiceEmail(generatedOrder, userId)
        }

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        // Validate that all items are still available and within the per-item order limit
        const unavailableItems = []
        const quantityLimitItems = []
        for(const item of list_items){
            const product = await ProductModel.findById(item.productId._id)
            if(!product || product.publish === false || product.stock <= 0){
                unavailableItems.push({
                    name: item.productId.name,
                    reason: !product ? 'Product deleted' : product.publish === false ? 'Product unavailable' : 'Out of stock'
                })
            }
            if(Number(item.quantity || 0) > MAX_ORDER_ITEM_QTY){
                quantityLimitItems.push({
                    name: item.productId.name,
                    quantity: Number(item.quantity || 0),
                    limit: MAX_ORDER_ITEM_QTY
                })
            }
        }

        if(quantityLimitItems.length > 0){
            return response.status(400).json({
                message : `Some items exceed the maximum allowed quantity of ${MAX_ORDER_ITEM_QTY}`,
                error : true,
                success : false,
                quantityLimitItems
            })
        }

        // If any items are unavailable, return error
        if(unavailableItems.length > 0){
            return response.status(400).json({
                message : "Some items are no longer available",
                error : true,
                success : false,
                unavailableItems : unavailableItems
            })
        }

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            const imageUrls = Array.isArray(item.productId.image)
              ? item.productId.image
              : item.productId.image
                ? [item.productId.image]
                : []

            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : imageUrls,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1,
                    maximum : 20
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        if(!Stripe){
            return response.status(500).json({
                message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in the server .env file.',
                error: true,
                success: false
            })
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []
    const invoiceId = `INV-${new mongoose.Types.ObjectId()}`

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)
            const productId = product.metadata.productId
            const productDoc = productId ? await ProductModel.findById(productId) : null
            const quantity = Math.min(Number(item.quantity || 1), 20)
            const costPrice = Number(productDoc?.costPrice || 0)
            const unitPrice = item.price?.unit_amount ? Number(item.price.unit_amount) / 100 : Number(item.amount_subtotal || 0) / quantity / 100

            const normalizedPaymentStatus = String(payment_status || '').toLowerCase()
            const displayPaymentStatus = normalizedPaymentStatus === 'paid' || normalizedPaymentStatus === 'completed' || normalizedPaymentStatus === 'online payment'
                ? 'Online Payment'
                : normalizedPaymentStatus === 'cash on delivery' || normalizedPaymentStatus === 'cod'
                ? 'COD'
                : payment_status || 'Pending'

            const paylod = {
                userId : userId,
                invoiceId : invoiceId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : productId,
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                quantity,
                unitPrice,
                costPrice,
                paymentId : paymentId,
                payment_status : displayPaymentStatus,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_subtotal / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const sig = request.headers['stripe-signature'];
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    let event;

    try {
        if (endPointSecret && sig) {
            // Verify webhook signature if secret is configured
            event = Stripe.webhooks.constructEvent(request.body, sig, endPointSecret);
        } else {
            // For development/testing, accept webhooks without signature verification
            event = JSON.parse(request.body);
        }
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      if(!Stripe){
        return response.status(500).json({
          message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in the server .env file.',
          error: true,
          success: false
        })
      }
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : 'Online Payment',
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})

            ///reduce stock for online payment
            for(const orderItem of orderProduct){
                await ProductModel.findByIdAndUpdate(orderItem.productId, {
                    $inc: { stock: -orderItem.quantity }
                })
            }

            // Send invoice email to customer
            await sendInvoiceEmail(order, userId)
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function resendInvoiceController(request,response){
    try {
        const userId = request.userId
        let { invoiceId } = request.body

        if (!invoiceId) {
            const latestOrder = await OrderModel.findOne({ userId }).sort({ createdAt: -1 })
            invoiceId = latestOrder?.invoiceId
        }

        if (!invoiceId) {
            return response.status(400).json({
                message: 'invoiceId is required or you must have at least one previous order',
                error: true,
                success: false
            })
        }

        const orderData = await OrderModel.find({ invoiceId, userId }).populate('delivery_address')

        if (!orderData || orderData.length === 0) {
            return response.status(404).json({
                message: 'No orders found for the provided invoice ID',
                error: true,
                success: false
            })
        }

        await sendInvoiceEmail(orderData, userId)

        return response.json({
            message: 'Invoice email resend initiated successfully',
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
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

export async function getSalesReportController(request,response){
    try {
        const now = new Date()
        const startOfToday = new Date(now)
        startOfToday.setHours(0,0,0,0)

        const startOfWeek = new Date(startOfToday)
        startOfWeek.setDate(startOfWeek.getDate() - 6)

        const startOfMonth = new Date(startOfToday)
        startOfMonth.setDate(startOfMonth.getDate() - 29)

        const buildReport = async (startDate) => {
            const results = await OrderModel.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: {
                    _id: null,
                    totalRevenue: { $sum: { $ifNull: ["$totalAmt", 0] } },
                    totalOrders: { $sum: 1 },
                    totalItems: { $sum: { $ifNull: ["$quantity", 0] } },
                    totalCost: { $sum: { $multiply: [{ $ifNull: ["$quantity", 0] }, { $ifNull: ["$costPrice", 0] }] } }
                } }
            ])

            const row = results[0] || { totalRevenue: 0, totalOrders: 0, totalItems: 0, totalCost: 0 }
            const grossProfit = Number(row.totalRevenue) - Number(row.totalCost)
            const profitMargin = row.totalRevenue > 0 ? (grossProfit / Number(row.totalRevenue)) * 100 : 0

            return {
                totalRevenue: Number(row.totalRevenue || 0),
                totalOrders: Number(row.totalOrders || 0),
                totalItems: Number(row.totalItems || 0),
                totalCost: Number(row.totalCost || 0),
                grossProfit: Number(grossProfit.toFixed(2)),
                profitMargin: Number(profitMargin.toFixed(2))
            }
        }

        const buildDailyRecords = async (days = 7) => {
            const startDate = new Date(startOfToday)
            startDate.setDate(startDate.getDate() - (days - 1))

            const grouped = await OrderModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        totalRevenue: { $sum: { $ifNull: ["$totalAmt", 0] } },
                        totalCost: { $sum: { $multiply: [{ $ifNull: ["$quantity", 0] }, { $ifNull: ["$costPrice", 0] }] } },
                        totalOrders: { $sum: 1 },
                        totalItems: { $sum: { $ifNull: ["$quantity", 0] } }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ])

            const recordMap = grouped.reduce((acc, row) => {
                acc[row._id] = row
                return acc
            }, {})

            const records = []
            for (let i = 0; i < days; i += 1) {
                const date = new Date(startDate)
                date.setDate(startDate.getDate() + i)
                const key = date.toISOString().slice(0, 10)
                const row = recordMap[key] || { totalRevenue: 0, totalCost: 0, totalOrders: 0, totalItems: 0 }
                const grossProfit = Number(row.totalRevenue) - Number(row.totalCost)
                const profitMargin = row.totalRevenue > 0 ? (grossProfit / Number(row.totalRevenue)) * 100 : 0
                records.push({
                    date: key,
                    totalRevenue: Number(row.totalRevenue || 0),
                    totalCost: Number(row.totalCost || 0),
                    totalOrders: Number(row.totalOrders || 0),
                    totalItems: Number(row.totalItems || 0),
                    grossProfit: Number(grossProfit.toFixed(2)),
                    profitMargin: Number(profitMargin.toFixed(2))
                })
            }
            return records
        }

        const buildPeakSalesTime = async (startDate) => {
            const [hourly, dailyOfWeek] = await Promise.all([
                OrderModel.aggregate([
                    {
                        $match: { createdAt: { $gte: startDate } }
                    },
                    {
                        $group: {
                            _id: { $hour: "$createdAt" },
                            totalRevenue: { $sum: { $ifNull: ["$totalAmt", 0] } },
                            totalOrders: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { totalRevenue: -1 }
                    },
                    { $limit: 1 }
                ]),
                OrderModel.aggregate([
                    {
                        $match: { createdAt: { $gte: startDate } }
                    },
                    {
                        $group: {
                            _id: { $dayOfWeek: "$createdAt" },
                            totalRevenue: { $sum: { $ifNull: ["$totalAmt", 0] } },
                            totalOrders: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { totalRevenue: -1 }
                    },
                    { $limit: 1 }
                ])
            ])

            const hourRow = hourly[0] || { _id: null, totalRevenue: 0, totalOrders: 0 }
            const dayRow = dailyOfWeek[0] || { _id: null, totalRevenue: 0, totalOrders: 0 }
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

            return {
                peakHour: hourRow._id,
                peakHourLabel: hourRow._id !== null ? `${hourRow._id}:00 - ${hourRow._id + 1}:00` : "N/A",
                peakHourRevenue: Number(hourRow.totalRevenue || 0),
                peakHourOrders: Number(hourRow.totalOrders || 0),
                peakDay: dayRow._id ? days[dayRow._id - 1] : "N/A",
                peakDayRevenue: Number(dayRow.totalRevenue || 0),
                peakDayOrders: Number(dayRow.totalOrders || 0)
            }
        }

        const [daily, weekly, monthly, dailyRecords, peakSalesTime] = await Promise.all([
            buildReport(startOfToday),
            buildReport(startOfWeek),
            buildReport(startOfMonth),
            buildDailyRecords(7),
            buildPeakSalesTime(startOfMonth)
        ])

        return response.json({
            message: "Sales report",
            data: {
                daily,
                weekly,
                monthly,
                dailyRecords,
                peakSalesTime
            },
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

