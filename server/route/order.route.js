import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, resendInvoiceController, getSalesReportController } from '../controllers/order.controller.js'
import { getPaymentQRCodeController, savePaymentQRCodeController } from '../controllers/paymentSetting.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/send-invoice',auth,resendInvoiceController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/payment-qr',auth,getPaymentQRCodeController)
orderRouter.put('/payment-qr',auth,admin,savePaymentQRCodeController)
orderRouter.get('/sales-report',auth,admin,getSalesReportController)

export default orderRouter