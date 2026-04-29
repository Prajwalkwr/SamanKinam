import UserModel from '../models/user.model.js';
import OrderModel from '../models/order.model.js';
import sendEmail from '../config/sendEmail.js';
import { generateInvoiceHTML } from './invoiceEmailTemplate.js';

const generateInvoiceText = (orderData, userName) => {
  const invoiceId = orderData[0]?.invoiceId || 'INV-UNKNOWN';
  const paymentStatus = orderData[0]?.payment_status || 'PENDING';
  const createdDate = new Date(orderData[0]?.createdAt || Date.now()).toLocaleString('en-US');

  let totalAmount = 0;
  const itemLines = orderData.map(item => {
    const quantity = item.quantity || 1;
    const unitPrice = Number(item.unitPrice || 0);
    const lineTotal = Number(item.totalAmt || unitPrice * quantity);
    totalAmount += lineTotal;
    return `${item.product_details?.name || 'Product'} | Qty: ${quantity} | Unit: Rs ${unitPrice.toFixed(2)} | Total: Rs ${lineTotal.toFixed(2)}`;
  }).join('\n');

  const address = orderData[0]?.delivery_address;
  const street = address?.address_line || address?.address || '';
  const addressText = address
    ? `${street}, ${address.city || ''}, ${address.state || ''} ${address.pincode || ''}`
    : 'Address not available';

  return `Invoice ID: ${invoiceId}\nDate: ${createdDate}\nCustomer: ${userName || 'Customer'}\nPayment status: ${paymentStatus}\n\nItems:\n${itemLines}\n\nDelivery Address:\n${addressText}\n\nTotal Amount: Rs ${totalAmount.toFixed(2)}\n\nThank you for your order from Saman Kinam.`;
};

export const sendInvoiceEmail = async (orderData, userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.email) {
      console.log('User email not found, skipping invoice email');
      return;
    }

    const customerEmail = String(user.email).trim().toLowerCase()
    const populatedOrders = await OrderModel.find({ invoiceId: orderData[0]?.invoiceId }).populate('delivery_address');
    if (!populatedOrders || populatedOrders.length === 0) {
      console.log('No order data found for invoice email, skipping.');
      return;
    }

    const invoiceHTML = generateInvoiceHTML(populatedOrders, customerEmail, user.name);
    const invoiceText = generateInvoiceText(populatedOrders, user.name);

    await sendEmail({
      sendTo: customerEmail,
      subject: `Your Order Invoice - ${populatedOrders[0]?.invoiceId || 'INV'}`,
      html: invoiceHTML,
      text: invoiceText,
    });

    console.log(`Invoice email sent successfully to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending invoice email:', error.message);
  }
};
