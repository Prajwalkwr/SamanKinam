export const generateInvoiceHTML = (orderData, userEmail, userName) => {
  // Group items by invoice ID
  const invoiceId = orderData[0]?.invoiceId || 'INV-UNKNOWN'
  const paymentStatus = orderData[0]?.payment_status || 'Pending'
  const normalizedStatus = String(paymentStatus).toLowerCase()
  const isPaid = normalizedStatus === 'paid' || normalizedStatus === 'completed' || normalizedStatus === 'online payment'
  const createdDate = new Date(orderData[0]?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const deliveryAddress = orderData[0]?.delivery_address || {}
  const street = deliveryAddress?.address_line || deliveryAddress?.address || ''
  const addressText = deliveryAddress ? 
    `${street}, ${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} ${deliveryAddress.pincode || ''}` 
    : 'Address not available'

  // Calculate totals
  let totalAmount = 0
  let totalQuantity = 0

  const itemsHTML = orderData.map(item => {
    totalAmount += item.totalAmt || 0
    totalQuantity += item.quantity || 0
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${item.product_details?.name || 'Product'}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; text-align: right;">Rs ${(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right;">Rs ${(item.totalAmt || 0).toFixed(2)}</td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-box {
          background-color: #f9f9f9;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #667eea;
        }
        .total-row {
          background-color: #f9f9f9;
          font-weight: 600;
          border-top: 2px solid #667eea;
        }
        .total-row td {
          padding: 15px 12px;
        }
        .amount {
          text-align: right;
          font-size: 16px;
          color: #667eea;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-cod {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-paid {
          background-color: #d4edda;
          color: #155724;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .thank-you {
          text-align: center;
          padding: 20px 0;
          color: #667eea;
          font-weight: 600;
        }
        .divider {
          height: 1px;
          background-color: #eee;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Invoice</h1>
          <p>Thank you for your purchase!</p>
        </div>

        <div class="content">
          <!-- Customer Info -->
          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${userName || 'Valued Customer'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${userEmail}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Invoice Details -->
          <div class="section">
            <div class="section-title">Invoice Details</div>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Invoice #:</span>
                <span class="info-value">${invoiceId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${createdDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">
                  <span class="status-badge ${isPaid ? 'status-paid' : 'status-cod'}">
                    ${paymentStatus}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Delivery Address -->
          <div class="section">
            <div class="section-title">Delivery Address</div>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Address:</span>
              </div>
              <div style="padding-left: 0; color: #333; font-size: 14px;">
                ${addressText}
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Order Items -->
          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr class="total-row">
                  <td colspan="2">Total Items: ${totalQuantity}</td>
                  <td colspan="2" class="amount">Total Amount: Rs ${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Thank You Message -->
          <div class="thank-you">
            Thank you for shopping with Saman Kinam! 🙏
          </div>
        </div>

        <div class="footer">
          <p>If you have any questions about your order, please contact our support team.</p>
          <p style="margin-top: 15px; color: #999;">
            © ${new Date().getFullYear()} Saman Kinam. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
