import express, { Request, Response } from 'express'
import * as path from 'node:path'
import { TodoRoutes } from './todo'
import { UserRoutes } from './user'
import * as fs from 'fs'
import { SportRoutes } from './sports'
import { UserStakeRoutes } from './userStake'
import { BetRoute } from './bet'
import { MatchRoutes } from './match'
import { MarketRoutes } from './market'
import { FancyRoutes } from './fancy'
import { AccountRoutes } from './account'
import Passport from '../passport/Passport'
import { AuthController } from '../controllers/AuthController'
import Http from '../middlewares/Http'
import { SportSettingsRoutes } from './sport-settings'
import { UserBookRoutes } from './book'
import { CasinoController } from '../controllers/CasinoController'
import { T10ResultRoutes } from './t10-result'
import { FancyController } from '../controllers/FancyController'
import { MatchController } from '../controllers/MatchController'
import { BetController } from '../controllers/BetController'
import SportsController from '../controllers/SportsController'
import { DepositWithdrawRoutes } from './deposit-withdraw'
import { CallbackRoutes } from './intcasino'
import { WhiteLabelRoutes } from './white-label'
import { WhiteLabelController } from '../controllers/WhiteLabelController'
import { DepositWithdrawController } from '../controllers/DepositWithdrawController'
import { updateDepositWithdraw } from '../validations/deposit-withdraw.validation'
import { DealersController } from '../controllers/DealersController'
import { AccountController } from '../controllers/AccountController'

const router = express.Router()

router.get('/api/t10', function (req, res) {
  const { id } = req.query
  return res.send(`<iframe src='https://alpha-n.qnsports.live/route/rih.php?id=${id}'></iframe>`)
})

router.post('/api/login', new AuthController().login)
router.post('/api/login-admin', new AuthController().loginAdmin)

router.post('/api/register-auto', new DealersController().registerAuto)


router.post('/api/login-staff', new AuthController().staffLogin)
router.get(
  '/api/setResult/:casinoType/:beforeResultSet?/:matchId?',
  new CasinoController().setResult,
)
router.get('/api/setResultByCron', new CasinoController().setResultByCron)
router.get('/api/setResultByTimePeriod', new CasinoController().setResultByTimePeriod)
router.post('/api/save-casino-match', new CasinoController().saveCasinoMatchData)
router.post('/api/update-tv', new CasinoController().updateTv)

router.get('/api/result-fancy-no-token', new FancyController().declarefancyresult)
router.post('/api/sh', function (req, res) {
  console.log(req.params, req.body, req.query)
  return res.json({ helloworld: true })
})
router.get('/api/set-market-result-by-cron', new MatchController().setResultApi)
 router.get(`/api/domain/:domain`,new WhiteLabelController().getWhiteLabelByDomain)


    router.post(
      '/api/get-deposit-withdraw-list-two',
      new DepositWithdrawController().getDepositWithdrawtwo,
    )

    // router.post(
    //   '/api/update-deposit-withdraw-status',
  
    //   updateDepositWithdraw,
     
    //   new DepositWithdrawController().updateDepositWithdraw,
    // )

router.get('/api/result-market-auto', new FancyController().declaremarketresultAuto)
router.get('/api/result-market-fancy-auto', new FancyController().setT10FancyResult)

router.post('/api/resend-telegram-otp',new AuthController().resendotp)
router.post('/api/verify-otp', new AuthController().verifyotp)
router.get('/api/set-telegram-webhook', new AuthController().setTelegramBotUrl)
router.post('/api/telegram-webhook', new AuthController().telegramwebhook)

router.post(
  '/api/resend-telegram-otp-after-login',
  // Passport.authenticateJWT,
  new AuthController().resendotp,
)

router.get('/api/get-business-fancy-list', new BetController().fancybetListSelection)
router.post('/api/update-fancy-result', new FancyController().updatefancyresultapi)
router.post('/api/get-user-list-staff',new DealersController().getUserListForStaff)
router.post('/api/user-account-balance-staff',new AccountController().saveUserDepositFCByStaff)

router.get('/api/resync_bookmaker_id', new SportsController().saveMatchResyncCron)
router.use('/api', new T10ResultRoutes().router)
router.use('/api', new SportRoutes().router)
router.use('/api/callback', new CallbackRoutes().router)

router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new TodoRoutes().router)

router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserStakeRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new BetRoute().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new MatchRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new MarketRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new FancyRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new AccountRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new SportSettingsRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserBookRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new DepositWithdrawRoutes().router)

// White-label routes
router.use('/api', Passport.authenticateJWT, Http.maintenance, new WhiteLabelRoutes().router)

// Public white-label routes (no auth required)
router.use('/api', new WhiteLabelRoutes().router)

// router.get("/", (req: Request, res: Response) => {
//   return res.json({ helloWorld: "Hello World" });
// });

router.get('/*', (req: Request, res: Response) => {
  // If there's white-label information in the request, send a customized index.html
  if (req.whiteLabel) {
    // Read the original index.html file
    fs.readFile(path.join(__dirname, '../../public', 'index.html'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading index.html:', err);
        return res.sendFile(path.join(__dirname, '../../public', 'index.html'));
      }
      
      // Customize the HTML with white-label settings
      let customizedHtml = data;
      
      // Update title
      if (req.whiteLabel.companyName) {
        customizedHtml = customizedHtml.replace(
          /<title>[^<]*<\/title>/,
          `<title>${req.whiteLabel.companyName}</title>`
        );
      }
      
      // Update favicon if available
      if (req.whiteLabel.faviconUrl) {
        customizedHtml = customizedHtml.replace(
          /<link rel="icon"[^>]*>/g,
          `<link rel="icon" type="image/x-icon" href="${req.whiteLabel.faviconUrl}">`
        );
      }
      
      // Add CSS variables for theme colors
      // const themeStyles = `
      // <style id="white-label-theme">
      //   :root {
      //     --primary-color: ${req.whiteLabel.primaryColor || '#007bff'};
      //     --secondary-color: ${req.whiteLabel.secondaryColor || '#6c757d'};
      //     --background-color: ${req.whiteLabel.backgroundColor || '#ffffff'};
      //     --text-color: ${req.whiteLabel.textColor || '#212529'};
      //     --font-family: '${req.whiteLabel.fontFamily || 'Arial, sans-serif'}';
      //   }
        
      //   body {
      //     background-color: var(--background-color) !important;
      //     color: var(--text-color) !important;
      //     font-family: var(--font-family) !important;
      //   }
        
      //   .btn-primary, button.btn-primary {
      //     background-color: var(--primary-color) !important;
      //     border-color: var(--primary-color) !important;
      //   }
        
      //   .btn-secondary {
      //     background-color: var(--secondary-color) !important;
      //     border-color: var(--secondary-color) !important;
      //   }
      // </style>`;
      
      // Insert the theme styles after the opening head tag
      // customizedHtml = customizedHtml.replace(
      //   /<head>/,
      //   `<head>${themeStyles}`
      // );
      
      res.send(customizedHtml);
    });
  } else {
    // Serve default index.html
    return res.sendFile(path.join(__dirname, '../../public', 'index.html'));
  }
})

export { router as routes }
