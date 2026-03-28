import { Router } from 'express'
import { WhiteLabelController } from '../controllers/WhiteLabelController'
import { ExternalApiController } from '../controllers/ExternalApiController'
import Passport from '../passport/Passport'
import Http from '../middlewares/Http'

const extApiCtrl = new ExternalApiController()

export class WhiteLabelRoutes {
  public router: Router
  public whiteLabelController: WhiteLabelController = new WhiteLabelController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    // Super admin routes
    this.router.post(
      '/create-white-label',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.createWhiteLabel
    )

    this.router.get(
      '/all-white-labels',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.getAllWhiteLabels
    )

    this.router.put(
      '/toggle-white-label/:whiteLabelId',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.toggleWhiteLabelStatus
    )

    // Admin routes (for current user's white-label)
    this.router.get(
      '/my-white-label',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.getCurrentUserWhiteLabel
    )

    this.router.put(
      '/update-white-label',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.updateWhiteLabel
    )

    // Public route to get white-label settings by domain
    this.router.get(
      '/domain/:domain',
      this.whiteLabelController.getWhiteLabelByDomain
    )

    // Get white-label by user ID
    this.router.get(
      '/user/:userId',
      Passport.authenticateJWT,
      Http.maintenance,
      this.whiteLabelController.getWhiteLabelByUserId
    )

    // ── API Key Management (for admin users) ──────────────────────────────────
    // POST /api/white-label/api-keys          → generate a new key
    this.router.post(
      '/api-keys',
      Passport.authenticateJWT,
      Http.maintenance,
      extApiCtrl.generateApiKey,
    )

    // GET /api/white-label/api-keys           → list keys (no secrets)
    this.router.get(
      '/api-keys',
      Passport.authenticateJWT,
      Http.maintenance,
      extApiCtrl.listApiKeys,
    )

    // DELETE /api/white-label/api-keys/:id    → revoke a key
    this.router.delete(
      '/api-keys/:id',
      Passport.authenticateJWT,
      Http.maintenance,
      extApiCtrl.revokeApiKey,
    )
  }
}