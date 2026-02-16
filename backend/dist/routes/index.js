"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const path = __importStar(require("node:path"));
const todo_1 = require("./todo");
const user_1 = require("./user");
const fs = __importStar(require("fs"));
const sports_1 = require("./sports");
const userStake_1 = require("./userStake");
const bet_1 = require("./bet");
const match_1 = require("./match");
const market_1 = require("./market");
const fancy_1 = require("./fancy");
const account_1 = require("./account");
const Passport_1 = __importDefault(require("../passport/Passport"));
const AuthController_1 = require("../controllers/AuthController");
const Http_1 = __importDefault(require("../middlewares/Http"));
const sport_settings_1 = require("./sport-settings");
const book_1 = require("./book");
const CasinoController_1 = require("../controllers/CasinoController");
const t10_result_1 = require("./t10-result");
const FancyController_1 = require("../controllers/FancyController");
const MatchController_1 = require("../controllers/MatchController");
const BetController_1 = require("../controllers/BetController");
const SportsController_1 = __importDefault(require("../controllers/SportsController"));
const deposit_withdraw_1 = require("./deposit-withdraw");
const intcasino_1 = require("./intcasino");
const white_label_1 = require("./white-label");
const WhiteLabelController_1 = require("../controllers/WhiteLabelController");
const router = express_1.default.Router();
exports.routes = router;
router.get('/api/t10', function (req, res) {
    const { id } = req.query;
    return res.send(`<iframe src='https://alpha-n.qnsports.live/route/rih.php?id=${id}'></iframe>`);
});
router.post('/api/login', new AuthController_1.AuthController().login);
router.post('/api/login-admin', new AuthController_1.AuthController().loginAdmin);
router.get('/api/setResult/:casinoType/:beforeResultSet?/:matchId?', new CasinoController_1.CasinoController().setResult);
router.get('/api/setResultByCron', new CasinoController_1.CasinoController().setResultByCron);
router.get('/api/setResultByTimePeriod', new CasinoController_1.CasinoController().setResultByTimePeriod);
router.post('/api/save-casino-match', new CasinoController_1.CasinoController().saveCasinoMatchData);
router.post('/api/update-tv', new CasinoController_1.CasinoController().updateTv);
router.get('/api/result-fancy-no-token', new FancyController_1.FancyController().declarefancyresult);
router.post('/api/sh', function (req, res) {
    console.log(req.params, req.body, req.query);
    return res.json({ helloworld: true });
});
router.get('/api/set-market-result-by-cron', new MatchController_1.MatchController().setResultApi);
router.get(`/api/domain/:domain`, new WhiteLabelController_1.WhiteLabelController().getWhiteLabelByDomain);
router.get('/api/result-market-auto', new FancyController_1.FancyController().declaremarketresultAuto);
router.get('/api/result-market-fancy-auto', new FancyController_1.FancyController().setT10FancyResult);
router.post('/api/resend-telegram-otp', new AuthController_1.AuthController().resendotp);
router.post('/api/verify-otp', new AuthController_1.AuthController().verifyotp);
router.get('/api/set-telegram-webhook', new AuthController_1.AuthController().setTelegramBotUrl);
router.post('/api/telegram-webhook', new AuthController_1.AuthController().telegramwebhook);
router.post('/api/resend-telegram-otp-after-login', 
// Passport.authenticateJWT,
new AuthController_1.AuthController().resendotp);
router.get('/api/get-business-fancy-list', new BetController_1.BetController().fancybetListSelection);
router.post('/api/update-fancy-result', new FancyController_1.FancyController().updatefancyresultapi);
router.get('/api/resync_bookmaker_id', new SportsController_1.default().saveMatchResyncCron);
router.use('/api', new t10_result_1.T10ResultRoutes().router);
router.use('/api', new sports_1.SportRoutes().router);
router.use('/api/callback', new intcasino_1.CallbackRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new user_1.UserRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new todo_1.TodoRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new userStake_1.UserStakeRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new bet_1.BetRoute().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new match_1.MatchRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new market_1.MarketRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new fancy_1.FancyRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new account_1.AccountRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new sport_settings_1.SportSettingsRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new book_1.UserBookRoutes().router);
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new deposit_withdraw_1.DepositWithdrawRoutes().router);
// White-label routes
router.use('/api', Passport_1.default.authenticateJWT, Http_1.default.maintenance, new white_label_1.WhiteLabelRoutes().router);
// Public white-label routes (no auth required)
router.use('/api', new white_label_1.WhiteLabelRoutes().router);
// router.get("/", (req: Request, res: Response) => {
//   return res.json({ helloWorld: "Hello World" });
// });
router.get('/*', (req, res) => {
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
                customizedHtml = customizedHtml.replace(/<title>[^<]*<\/title>/, `<title>${req.whiteLabel.companyName}</title>`);
            }
            // Update favicon if available
            if (req.whiteLabel.faviconUrl) {
                customizedHtml = customizedHtml.replace(/<link rel="icon"[^>]*>/g, `<link rel="icon" type="image/x-icon" href="${req.whiteLabel.faviconUrl}">`);
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
    }
    else {
        // Serve default index.html
        return res.sendFile(path.join(__dirname, '../../public', 'index.html'));
    }
});
//# sourceMappingURL=index.js.map