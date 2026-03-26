import { Router } from 'express'
import { ExternalApiController } from '../controllers/ExternalApiController'
import { externalApiAuth } from '../middlewares/ExternalApiMiddleware'

const controller = new ExternalApiController()

export class ExternalApiRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    /**
     * POST /api/external/balance/update
     * Headers: X-Api-Key, X-Timestamp, X-Nonce, X-Signature
     * Body: { username, amount, type: 'D'|'W', narration? }
     */
    this.router.post('/balance/update', externalApiAuth, controller.updateBalance)

    /**
     * GET /api/external/balance?username=xxx
     * Headers: X-Api-Key, X-Timestamp, X-Nonce, X-Signature
     */
    this.router.get('/balance', externalApiAuth, controller.getBalance)
  }
}
