import { model, Document, Schema, Types } from 'mongoose'
import crypto from 'crypto'

export interface IApiKey {
  whiteLabelId: Types.ObjectId // which white-label this key belongs to
  key: string                  // public API key (UUID)
  secretHash: string           // bcrypt/sha256 hash of secret
  label?: string               // optional human label
  isActive: boolean
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IApiKeyModel extends IApiKey, Document {}

const ApiKeySchema: Schema = new Schema(
  {
    whiteLabelId: { type: Types.ObjectId, ref: 'WhiteLabel', required: true },
    key: { type: String, required: true, unique: true },
    secretHash: { type: String, required: true },
    label: { type: String },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

ApiKeySchema.index({ key: 1 })

/** Generate a key/secret pair. Returns plaintext secret (store only the hash). */
export function generateApiKeyPair(): { key: string; secret: string } {
  const key = crypto.randomUUID()
  const secret = crypto.randomBytes(32).toString('hex')
  return { key, secret }
}

/** Hash a plaintext secret with SHA-256 for storage */
export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex')
}

/** Verify a plaintext secret against its stored hash */
export function verifySecret(secret: string, secretHash: string): boolean {
  const hash = hashSecret(secret)
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(secretHash))
}

export const ApiKey = model<IApiKeyModel>('ApiKey', ApiKeySchema)

