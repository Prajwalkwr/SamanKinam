import mongoose from 'mongoose'

const paymentSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

const PaymentSettingModel = mongoose.model('PaymentSetting', paymentSettingSchema)

export default PaymentSettingModel
