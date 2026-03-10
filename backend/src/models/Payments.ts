import { Types } from 'mongoose'
import { model, Schema, Document } from 'mongoose'

interface IPaymentAccount extends Document {
  userId: Types.ObjectId
  bankName: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  upiName: string
  upiQrCode: string
  isActive: boolean
}

const PaymentAccountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    bankName: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true },
    upiId: { type: String, required: true, trim: true },
    upiName: { type: String, trim: true },
    upiQrCode: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

const PaymentAccount = model<IPaymentAccount>('PaymentAccount', PaymentAccountSchema)

export { IPaymentAccount, PaymentAccount }
