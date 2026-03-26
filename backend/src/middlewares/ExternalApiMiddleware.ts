import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { createClient } from 'redis'
import { ApiKey } from '../models/ApiKey'

// ── Redis client for nonce tracking ──────────────────────────────────────────
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_QUEUE_HOST || 'localhost',
    port: +(process.env.REDIS_QUEUE_PORT || 6379),
  },
})

// Connect once (fire-and-forget; if Redis is down, nonce protection is skipped
// and an error is logged rather than crashing the server)
redisClient.connect().catch((err: any) => {
  console.error('[ExternalApiMiddleware] Redis connection error:', err)
})

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000 // ±5 minutes
const NONCE_TTL_SECONDS = 10 * 60            // store nonces 10 minutes

// ── Middleware ────────────────────────────────────────────────────────────────
/**
 * Validates external-API requests:
 *  1. X-Api-Key header   → look up ApiKey document
 *  2. X-Timestamp        → within ±5 min of server time (ms unix epoch)
 *  3. X-Nonce            → not seen before (stored in Redis)
 *  4. X-Signature        → HMAC-SHA256 of canonical string
 *
 *  Canonical string: METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY_JSON
 *
 *  On success attaches req.apiKeyDoc and calls next().
 */
export async function externalApiAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string
  const timestamp = req.headers['x-timestamp'] as string
  const nonce = req.headers['x-nonce'] as string
  const signature = req.headers['x-signature'] as string

  if (!apiKey || !timestamp || !nonce || !signature) {
    res.status(401).json({
      error: 'Missing required auth headers (x-api-key, x-timestamp, x-nonce, x-signature)',
    })
    return
  }

  // 1. Timestamp window check
  const reqTime = parseInt(timestamp, 10)
  if (isNaN(reqTime) || Math.abs(Date.now() - reqTime) > TIMESTAMP_TOLERANCE_MS) {
    res.status(401).json({ error: 'Request timestamp out of allowed range (±5 min)' })
    return
  }

  // 2. Look up API key
  const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true })
  if (!keyDoc) {
    res.status(401).json({ error: 'Invalid or inactive API key' })
    return
  }

  // 3. Nonce replay check (Redis)
  const nonceRedisKey = `ext-api-nonce:${apiKey}:${nonce}`
  try {
    const nonceExists = await redisClient.get(nonceRedisKey)
    if (nonceExists) {
      res.status(400).json({ error: 'Nonce already used — replay request rejected' })
      return
    }
  } catch (redisErr) {
    console.error('[ExternalApiMiddleware] Redis get error (nonce check skipped):', redisErr)
  }

  // 4. HMAC-SHA256 verification
  // The signature is computed over: METHOD + \n + PATH + \n + TIMESTAMP + \n + NONCE + \n + BODY_JSON
  // The signing key is the owner's PLAINTEXT secret on their side;
  // we store only the SHA-256 hash of the secret. So the caller must sign with:
  //   HMAC-SHA256(secret, canonical)
  // and we verify by computing:
  //   HMAC-SHA256(secretHash, canonical)  — same key used in our hash derivation
  const bodyStr =
    req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : ''
  const canonical = [req.method.toUpperCase(), req.path, timestamp, nonce, bodyStr].join('\n')

  // Use stored secretHash as the HMAC key (caller derives signature the same way)
  const expectedSig = crypto
    .createHmac('sha256', keyDoc.secretHash)
    .update(canonical)
    .digest('hex')

  let sigMatch = false
  try {
    sigMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(signature.toLowerCase().trim(), 'hex'),
    )
  } catch {
    sigMatch = false
  }

  if (!sigMatch) {
    res.status(401).json({ error: 'Invalid signature' })
    return
  }

  // 5. Store nonce in Redis (fire-and-forget on error)
  try {
    await redisClient.set(nonceRedisKey, '1', { EX: NONCE_TTL_SECONDS })
  } catch (redisErr) {
    console.error('[ExternalApiMiddleware] Redis set error (nonce not stored):', redisErr)
  }

  // 6. Update lastUsedAt (fire-and-forget)
  ApiKey.findByIdAndUpdate(keyDoc._id, { lastUsedAt: new Date() }).exec()

  // Attach key doc for controller use
  ;(req as any).apiKeyDoc = keyDoc
  next()
}
