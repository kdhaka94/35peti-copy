import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface IQrCode {
  _id: string
  upiId: string
  qrImageUrl: string
  userId: PopulatedDoc<IUser>
}

interface IQrCodeModel extends Document {}

const QrCodeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    upiId: String,
    qrImageUrl: String,
  },
  {
    timestamps: true,
  },
)

const QrCode = model<typeof QrCodeSchema>('QrCode', QrCodeSchema)

export { IQrCode, IQrCodeModel, QrCode }
