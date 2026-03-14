import { Types } from 'mongoose'
import { model, Schema, Document } from 'mongoose'

interface IPaymentAccount extends Document {
  userId: Types.ObjectId
  accountType: 'bank' | 'usdt'
  bankName: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  upiName: string
  upiQrCode: string
  walletAddress: string
  network: string
  isActive: boolean
}

const PaymentAccountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    accountType: { type: String, enum: ['bank', 'usdt'], default: 'bank' },
    bankName: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    upiId: { type: String, trim: true },
    upiName: { type: String, trim: true },
    upiQrCode: { type: String, default: null },
    walletAddress: { type: String, trim: true },
    network: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

const PaymentAccount = model<IPaymentAccount>('PaymentAccount', PaymentAccountSchema)

export { IPaymentAccount, PaymentAccount }
