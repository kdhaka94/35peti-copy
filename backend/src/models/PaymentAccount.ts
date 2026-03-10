import { Types } from 'mongoose'
import { model, Schema } from 'mongoose'

interface IPaymentAccount extends Document {
  bankName: string
  upiId: string
  upiName: string
  upiQrCode: string
  ifscCode: string
  accountNumber: string
  accountHolderName: string
  isActive: boolean
  userId: Types.ObjectId
}

const PaymentAccountSchema = new Schema(
  {
    bankName: String,
    upiId: String,
    upiName: String,
    upiQrCode: String,
    ifscCode: String,
    accountNumber: String,
    accountHolderName: String,
    isActive: { type: Boolean, default: true },
    userId: { type: Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
)

const PaymentAccount = model<typeof PaymentAccountSchema>('PaymentAccount', PaymentAccountSchema)

export { IPaymentAccount, PaymentAccount }
