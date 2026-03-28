import { Request, Response } from 'express'
import { Types } from 'mongoose'
import crypto from 'crypto'
import { createClient } from 'redis'
import { ApiController } from './ApiController'
import { AccoutStatement, ChipsType, IAccoutStatement } from '../models/AccountStatement'
import { Balance } from '../models/Balance'
import { TxnType } from '../models/UserChip'
import { User } from '../models/User'
import { WhiteLabel } from '../models/WhiteLabel'
import { ApiKey, generateApiKeyPair, hashSecret } from '../models/ApiKey'
import UserSocket from '../sockets/user-socket'

// Redis client for iframe session tokens
const iframeRedis = createClient({
  socket: {
    host: process.env.REDIS_QUEUE_HOST || 'localhost',
    port: +(process.env.REDIS_QUEUE_PORT || 6379),
  },
})
iframeRedis.connect().catch((err: any) => {
  console.error('[ExternalApiController] Redis connection error:', err)
})

const SESSION_TOKEN_TTL = 5 * 60 // 5 minutes

export class ExternalApiController extends ApiController {
  constructor() {
    super()
    this.updateBalance = this.updateBalance.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.launchIframe = this.launchIframe.bind(this)
    this.validateSession = this.validateSession.bind(this)
  }

  // ── Internal helpers (same logic as AccountController helpers) ──────────────

  private async getUserBalance(userId: string): Promise<number> {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: Types.ObjectId(userId) } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ])
    return ac.length > 0 ? ac[0].totalAmount : 0
  }

  private async getUserDepWithBalance(userId: string): Promise<number> {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: Types.ObjectId(userId), type: ChipsType.fc } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ])
    return ac.length > 0 ? ac[0].totalAmount : 0
  }

  // ── POST /api/external/balance/update ──────────────────────────────────────
  /**
   * Body:
   *  - username: string       — target user
   *  - amount: number         — positive amount
   *  - type: 'D' | 'W'       — Deposit or Withdraw
   *  - narration?: string     — optional description
   */
  async updateBalance(req: Request, res: Response): Promise<Response> {
    try {
      const { username, amount, type, narration = 'External API transaction' } = req.body
      const apiKeyDoc: any = (req as any).apiKeyDoc

      if (!username || !amount || !type) {
        return this.fail(res, 'username, amount, and type (D|W) are required')
      }
      if (!['D', 'W'].includes(type)) {
        return this.fail(res, "type must be 'D' (deposit) or 'W' (withdraw)")
      }
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return this.fail(res, 'amount must be a positive number')
      }

      // Resolve white-label owner (acts as the "parent" for the transaction)
      const whiteLabel = await WhiteLabel.findById(apiKeyDoc.whiteLabelId)
      if (!whiteLabel || !whiteLabel.isActive) {
        return this.fail(res, 'White-label is not active')
      }

      const parentUser = await User.findById(whiteLabel.userId)
      if (!parentUser) {
        return this.fail(res, 'White-label owner not found')
      }

      // Resolve target user (must be under this white-label's owner)
      const targetUser: any = await User.findOne({
        username,
        parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUser._id) } },
      })
      if (!targetUser) {
        return this.fail(res, `User '${username}' not found under this white-label`)
      }

      const userId = targetUser._id.toString()
      const parentUserId = parentUser._id.toString()

      const parentBal: any = await Balance.findOne({ userId: Types.ObjectId(parentUserId) })

      if (type === 'D') {
        // Check parent has enough balance to give
        if (parentBal && parentBal.balance - parentBal.exposer < numAmount) {
          return this.fail(res, 'White-label account has insufficient balance for this deposit')
        }

        const userOpenBal = await this.getUserBalance(userId)
        const parentOpenBal = await this.getUserBalance(parentUserId)

        // User credit entry
        const userEntry: IAccoutStatement = {
          userId,
          narration,
          amount: numAmount,
          type: ChipsType.fc,
          txnType: TxnType.cr,
          openBal: userOpenBal,
          closeBal: userOpenBal + numAmount,
          txnBy: `external-api/${parentUser.username}`,
        }
        const userStmt = new AccoutStatement(userEntry)
        await userStmt.save()

        const mbalUser = await this.getUserDepWithBalance(userId)
        await Balance.findOneAndUpdate(
          { userId },
          { balance: userStmt.closeBal, mainBalance: mbalUser },
          { new: true, upsert: true },
        )

        // Parent debit entry
        const parentEntry: IAccoutStatement = {
          userId: parentUserId,
          narration,
          amount: -numAmount,
          type: ChipsType.fc,
          txnType: TxnType.dr,
          openBal: parentOpenBal,
          closeBal: parentOpenBal - numAmount,
          txnId: userStmt._id,
          txnBy: `external-api/${username}`,
        }
        const parentStmt = new AccoutStatement(parentEntry)
        await parentStmt.save()

        const mbalParent = await this.getUserDepWithBalance(parentUserId)
        await Balance.findOneAndUpdate(
          { userId: parentUserId },
          { balance: parentStmt.closeBal, mainBalance: mbalParent },
          { new: true, upsert: true },
        )
        await AccoutStatement.updateOne(
          { _id: Types.ObjectId(userStmt._id) },
          { $set: { txnId: Types.ObjectId(parentStmt._id) } },
        )

        UserSocket.setExposer({ balance: userStmt.closeBal, userId })
        return this.success(res, { balance: userStmt.closeBal }, 'Balance deposited successfully')
      } else {
        // Withdraw
        const userBal: any = await Balance.findOne({ userId })
        const availableBalance = userBal ? userBal.balance - (userBal.exposer || 0) : 0
        if (availableBalance < numAmount) {
          return this.fail(res, 'User has insufficient balance for this withdrawal')
        }

        const userOpenBal = await this.getUserBalance(userId)
        const parentOpenBal = await this.getUserBalance(parentUserId)

        // User debit
        const userEntry: IAccoutStatement = {
          userId,
          narration,
          amount: -numAmount,
          type: ChipsType.fc,
          txnType: TxnType.dr,
          openBal: userOpenBal,
          closeBal: userOpenBal - numAmount,
          txnBy: `external-api/${parentUser.username}`,
        }
        const userStmt = new AccoutStatement(userEntry)
        await userStmt.save()

        const mbalUser = await this.getUserDepWithBalance(userId)
        await Balance.findOneAndUpdate(
          { userId },
          { balance: userStmt.closeBal, mainBalance: mbalUser },
          { new: true, upsert: true },
        )

        // Parent credit
        const parentEntry: IAccoutStatement = {
          userId: parentUserId,
          narration,
          amount: numAmount,
          type: ChipsType.fc,
          txnType: TxnType.cr,
          openBal: parentOpenBal,
          closeBal: parentOpenBal + numAmount,
          txnId: userStmt._id,
          txnBy: `external-api/${username}`,
        }
        const parentStmt = new AccoutStatement(parentEntry)
        await parentStmt.save()

        const mbalParent = await this.getUserDepWithBalance(parentUserId)
        await Balance.findOneAndUpdate(
          { userId: parentUserId },
          { balance: parentStmt.closeBal, mainBalance: mbalParent },
          { new: true, upsert: true },
        )

        UserSocket.setExposer({ balance: userStmt.closeBal, userId })
        return this.success(res, { balance: userStmt.closeBal }, 'Balance withdrawn successfully')
      }
    } catch (e: any) {
      console.error('[ExternalApiController.updateBalance]', e)
      return this.fail(res, e)
    }
  }

  // ── GET /api/external/balance?username=xxx ─────────────────────────────────
  async getBalance(req: Request, res: Response): Promise<Response> {
    try {
      const username = req.query.username as string
      const apiKeyDoc: any = (req as any).apiKeyDoc

      if (!username) {
        return this.fail(res, 'username query param is required')
      }

      const whiteLabel = await WhiteLabel.findById(apiKeyDoc.whiteLabelId)
      if (!whiteLabel) return this.fail(res, 'White-label not found')

      const parentUser = await User.findById(whiteLabel.userId)
      if (!parentUser) return this.fail(res, 'White-label owner not found')

      const targetUser: any = await User.findOne({
        username,
        parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUser._id) } },
      })
      if (!targetUser) return this.fail(res, `User '${username}' not found under this white-label`)

      const balDoc: any = await Balance.findOne({ userId: targetUser._id })
      const balance = balDoc?.balance ?? 0
      const exposer = balDoc?.exposer ?? 0
      const available = balance - exposer

      return this.success(res, { username, balance, exposer, available })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // ── POST /api/external/iframe/launch ───────────────────────────────────────
  /**
   * Generates a short-lived session token for a user to enter an iframe game.
   * Body: { username, gameUrl? }
   * Returns: { token, gameUrl }
   */
  async launchIframe(req: Request, res: Response): Promise<Response> {
    try {
      const { username, gameUrl } = req.body
      const apiKeyDoc: any = (req as any).apiKeyDoc

      if (!username) {
        return this.fail(res, 'username is required')
      }

      const whiteLabel = await WhiteLabel.findById(apiKeyDoc.whiteLabelId)
      if (!whiteLabel || !whiteLabel.isActive) {
        return this.fail(res, 'White-label is not active')
      }

      const parentUser = await User.findById(whiteLabel.userId)
      if (!parentUser) {
        return this.fail(res, 'White-label owner not found')
      }

      // Verify user exists under this white-label
      const targetUser: any = await User.findOne({
        username,
        parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUser._id) } },
      })
      if (!targetUser) {
        return this.fail(res, `User '${username}' not found under this white-label`)
      }

      // Get current balance
      const balDoc: any = await Balance.findOne({ userId: targetUser._id })
      const balance = balDoc?.balance ?? 0
      const exposer = balDoc?.exposer ?? 0

      // Generate a random session token
      const token = crypto.randomBytes(32).toString('hex')
      const sessionData = JSON.stringify({
        username,
        userId: targetUser._id.toString(),
        whiteLabelId: whiteLabel._id.toString(),
        parentUserId: parentUser._id.toString(),
        balance,
        available: balance - exposer,
        createdAt: Date.now(),
      })

      // Store in Redis with TTL
      await iframeRedis.set(`iframe-session:${token}`, sessionData, { EX: SESSION_TOKEN_TTL })

      const finalGameUrl = gameUrl || 'https://mrd0018.com'

      return this.success(res, {
        token,
        gameUrl: `${finalGameUrl}/iframe-game?token=${token}`,
        expiresIn: SESSION_TOKEN_TTL,
      }, 'Session token created')
    } catch (e: any) {
      console.error('[ExternalApiController.launchIframe]', e)
      return this.fail(res, e)
    }
  }

  // ── POST /api/external/iframe/validate ─────────────────────────────────────
  /**
   * Called by the iframe host (mrd0018) to validate a session token.
   * Body: { token }
   * Returns: { username, balance, available }
   */
  async validateSession(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.body

      if (!token) {
        return this.fail(res, 'token is required')
      }

      const sessionStr = await iframeRedis.get(`iframe-session:${token}`)
      if (!sessionStr) {
        return this.fail(res, 'Session token is invalid or expired')
      }

      const session = JSON.parse(sessionStr)

      // Fetch fresh balance
      const balDoc: any = await Balance.findOne({ userId: session.userId })
      const balance = balDoc?.balance ?? 0
      const exposer = balDoc?.exposer ?? 0

      // Consume the token (one-time use)
      await iframeRedis.del(`iframe-session:${token}`)

      return this.success(res, {
        username: session.username,
        userId: session.userId,
        balance,
        exposer,
        available: balance - exposer,
      }, 'Session validated')
    } catch (e: any) {
      console.error('[ExternalApiController.validateSession]', e)
      return this.fail(res, e)
    }
  }

  // ── ADMIN: generate API key for a white-label ──────────────────────────────
  generateApiKey = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      const { label } = req.body

      // Find this user's white-label
      const whiteLabel = await WhiteLabel.findOne({ userId: currentUser._id })
      if (!whiteLabel) return this.fail(res, 'White-label not found for your account')

      const { key, secret } = generateApiKeyPair()
      const secretHash = hashSecret(secret)

      const apiKey = new ApiKey({
        whiteLabelId: whiteLabel._id,
        key,
        secretHash,
        label: label || 'Default',
      })
      await apiKey.save()

      // Return secret ONCE — it is not stored in plaintext
      return this.success(
        res,
        {
          id: apiKey._id,
          key,
          secret, // ← shown only once; operator must save it
          label: apiKey.label,
          createdAt: apiKey.createdAt,
        },
        'API key created. Save the secret — it will not be shown again.',
      )
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // ── ADMIN: list API keys ───────────────────────────────────────────────────
  listApiKeys = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      const whiteLabel = await WhiteLabel.findOne({ userId: currentUser._id })
      if (!whiteLabel) return this.fail(res, 'White-label not found for your account')

      const keys = await ApiKey.find(
        { whiteLabelId: whiteLabel._id },
        { secretHash: 0 }, // never expose hash
      ).sort({ createdAt: -1 })

      return this.success(res, { keys })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  // ── ADMIN: revoke an API key ───────────────────────────────────────────────
  revokeApiKey = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      const { id } = req.params

      const whiteLabel = await WhiteLabel.findOne({ userId: currentUser._id })
      if (!whiteLabel) return this.fail(res, 'White-label not found for your account')

      const apiKey = await ApiKey.findOneAndUpdate(
        { _id: id, whiteLabelId: whiteLabel._id },
        { isActive: false },
        { new: true },
      )
      if (!apiKey) return this.fail(res, 'API key not found')

      return this.success(res, { id: apiKey._id, isActive: false }, 'API key revoked')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
