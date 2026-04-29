import PaymentSettingModel from '../models/paymentSetting.model.js'

export const getPaymentQRCodeController = async (request, response) => {
  try {
    const setting = await PaymentSettingModel.findOne({ key: 'payment_qr_url' })
    return response.json({
      message: 'Payment QR code fetched successfully',
      success: true,
      error: false,
      data: setting?.value || ''
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || 'Failed to fetch payment QR code',
      error: true,
      success: false
    })
  }
}

export const savePaymentQRCodeController = async (request, response) => {
  try {
    const { qrUrl } = request.body

    if (typeof qrUrl !== 'string') {
      return response.status(400).json({
        message: 'Invalid QR code URL',
        error: true,
        success: false
      })
    }

    const setting = await PaymentSettingModel.findOneAndUpdate(
      { key: 'payment_qr_url' },
      { value: qrUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return response.json({
      message: 'Payment QR code saved successfully',
      success: true,
      error: false,
      data: setting.value
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || 'Failed to save payment QR code',
      error: true,
      success: false
    })
  }
}
