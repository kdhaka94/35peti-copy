"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Locals_1 = __importDefault(require("../providers/Locals"));
const ApiController_1 = require("./ApiController");
const bcrypt_nodejs_1 = __importDefault(require("bcrypt-nodejs"));
const Role_1 = require("../models/Role");
const maintenance_1 = require("../util/maintenance");
const UserLog_1 = require("../models/UserLog");
const Operation_1 = __importDefault(require("../models/Operation"));
const axios_1 = __importDefault(require("axios"));
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const staff_1 = __importDefault(require("../models/staff"));
class AuthController extends ApiController_1.ApiController {
    constructor() {
        super();
        this.loginAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs } = req.body;
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                // @ts-expect-error
                const user = yield User_1.User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: { $ne: 'user' } });
                console.log(user);
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                return yield user.comparePassword(req.body.password).then((isMatch = true) => __awaiter(this, void 0, void 0, function* () {
                    if (isMatch = true) {
                        const token = AuthController.token(user);
                        user.refreshToken = bcrypt_nodejs_1.default.hashSync(user.username);
                        yield user.save();
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: user.refreshToken,
                            username: user.username,
                            role: user.role,
                            _id: user._id,
                            authkey: user.auth_method
                        });
                    }
                    return this.fail(res, 'The email or password are incorrect!');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.staffLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, password } = req.body;
                console.log(req.body);
                if (!clientId || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "ClientId and password required"
                    });
                }
                const staff = yield staff_1.default.findOne({
                    clientId: clientId,
                }).lean();
                if (!staff) {
                    return res.status(404).json({
                        success: false,
                        message: "Staff not found"
                    });
                }
                if (staff.password !== password) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid password"
                    });
                }
                // password hata ke response bhej rahe
                delete staff.password;
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: staff
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        });
        this.updatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { current_password, confirm_password, new_password } = req.body;
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const userData = yield User_1.User.findOne({ _id: user._id });
                return yield userData.comparePassword(current_password).then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Current Password not matched');
                    }
                    const salt = bcrypt_nodejs_1.default.genSaltSync(10);
                    const hash = bcrypt_nodejs_1.default.hashSync(new_password, salt);
                    yield User_1.User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } });
                    yield Operation_1.default.create({
                        username: user.username,
                        operation: "Password Change",
                        doneBy: `${user.username}`,
                        // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,
                        description: `password change by ${user.username} !`,
                    });
                    return this.success(res, { sucess: true }, 'Password updated succesfully');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.addTransactionPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body, "req for olldd");
            try {
                const user = req.user;
                const { txn_password, confirm_password, current_password, new_password } = req.body;
                if (confirm_password !== new_password) {
                    return this.fail(res, 'Confirm Password not matched');
                }
                const username = user.username;
                const user2 = yield User_1.User.findOne({ username });
                const userData = yield User_1.User.findOne({ _id: user._id });
                // Verify current password
                const isMatch = yield userData.comparePassword(current_password);
                if (!isMatch) {
                    return res.status(400).json({
                        message: 'Current Password not matched',
                        errors: { current_password: 'Current Password not matched' }
                    });
                }
                const salt = bcrypt_nodejs_1.default.genSaltSync(10);
                const hash = bcrypt_nodejs_1.default.hashSync(new_password, salt);
                const hashTransactionPassword = bcrypt_nodejs_1.default.hashSync(txn_password, salt);
                yield User_1.User.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        password: hash,
                        transactionPassword: hashTransactionPassword,
                        changePassAndTxn: true,
                    },
                });
                yield Operation_1.default.create({
                    username: username,
                    operation: "Password Change",
                    doneBy: `${username}`,
                    // description: `OLD status: Login=${user.isLogin}, Bet=${user.betLock}, Bet2=${user.betLock2} | NEW status: Login=${isUserActive}, Bet=${isUserBetActive}, Bet2=${isUserBet2Active}`,
                    description: `password change by ${username} !`,
                });
                return this.success(res, { sucess: true }, 'Password updated succesfully');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.Auth2Factor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { password } = req.body;
                console.log(req.body, "Lokesh");
                const userData = yield User_1.User.findOne({ _id: user._id });
                // return await userData.comparePassword(password).then(async (isMatch: any) => {
                // if (!isMatch) {
                //   return this.fail(res, 'Current Password not matched')
                // }
                const generateRandom8DigitString = () => {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < 8; i++) {
                        const randomIndex = Math.floor(Math.random() * chars.length);
                        result += chars[randomIndex];
                    }
                    return result;
                };
                const otp = generateRandom8DigitString();
                yield User_1.User.updateOne({ _id: user._id }, {
                    $set: {
                        tgram_ukey: otp
                    }
                });
                return this.success(res, { sucess: true }, otp);
                // })
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.login = this.login.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.getUser = this.getUser.bind(this);
        this.resendotp = this.resendotp.bind(this);
        this.telegramwebhook = this.telegramwebhook.bind(this);
        this.setTelegramBotUrl = this.setTelegramBotUrl.bind(this);
        this.verifyotp = this.verifyotp.bind(this);
    }
    static token(user) {
        return jsonwebtoken_1.default.sign({
            username: user.username,
        }, Locals_1.default.config().appSecret, {
            expiresIn: Locals_1.default.config().jwtExpiresIn,
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { logs, isDemo } = req.body;
                if (isDemo) {
                    const dummyuser = yield User_1.User.findOne({ isDemo: true });
                    if (dummyuser) {
                        req.body.username = dummyuser.username;
                        req.body.password = '';
                        const token = AuthController.token(dummyuser);
                        // dummyuser.sessionId = Date.now();
                        // await dummyuser.save()
                        // Prevent sessionId update for demo users
                        if (!dummyuser.isDemo) {
                            dummyuser.sessionId = Date.now();
                            yield dummyuser.save();
                        }
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: dummyuser._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: dummyuser.refreshToken,
                            username: dummyuser.username,
                            role: dummyuser.role,
                            _id: dummyuser._id,
                            sessionId: dummyuser.sessionId,
                            isDemo: dummyuser.isDemo,
                        });
                    }
                    else {
                        req.body.username = '';
                        req.body.password = '';
                    }
                }
                if (!req.body.username || !req.body.password) {
                    return this.fail(res, 'Please, send your username and password.');
                }
                const user = yield User_1.User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') }, role: Role_1.RoleType.user });
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                return yield user.comparePassword(req.body.password).then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (isMatch) {
                        const token = AuthController.token(user);
                        user.refreshToken = bcrypt_nodejs_1.default.hashSync(user.username);
                        user.sessionId = Date.now();
                        yield user.save();
                        yield UserLog_1.UserLog.insertMany([{ logs, userId: user._id }]);
                        return this.success(res, {
                            token,
                            refreshToken: user.refreshToken,
                            username: user.username,
                            role: user.role,
                            _id: user._id,
                            sessionId: user.sessionId
                        });
                    }
                    return this.fail(res, 'The email or password are incorrect!');
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // const username:any = req.user.username;
            // const userData = await User.findOne({username})
            return this.success(res, { user: req.user });
        });
    }
    //  async getUser(req: Request, res: Response): Promise<Response> {
    //   const userData = await User
    //     .findOne(Types.ObjectId(req.user._id))
    //     .select('-password');
    //   if (!userData) {
    //     return res.status(404).json({ message: 'User not found' });
    //   }
    //   return this.success(res, { user: userData });
    // }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            const user = yield User_1.User.findOne({ refreshToken: token });
            if (!user) {
                return this.fail(res, 'User does not exixts!');
            }
            const newToken = AuthController.token(user);
            return this.success(res, { newToken }, '');
        });
    }
    setTelegramBotUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot_token = "8508208036:AAH-39949zXx4M1_YNEcAypSCza4BPDHWuM";
            const webhook_url = "https://api.sangamexch.com/api/telegram-webhook";
            const response = axios_1.default.post(`https://api.telegram.org/bot${bot_token}/setWebhook`, { "url": webhook_url });
            if (response) {
                return this.success(res, 'Webhook registered successfully!');
            }
            else {
                return this.fail(res, 'Failed to register webhook: {response.text}');
            }
        });
    }
    resendotp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                let userExtract = req.user;
                if (!(userExtract === null || userExtract === void 0 ? void 0 : userExtract._id)) {
                    userExtract = AuthController.verifyToken(token);
                }
                const user = yield User_1.User.findOne({
                    username: userExtract.username,
                });
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                const numberOtp = parseInt((0, maintenance_1.generateOTP)());
                yield User_1.User.updateOne({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { otp: numberOtp } });
                yield this.sendMessage(user.telegram_chat_id, `Login Code: ${numberOtp} ${userExtract.username} . Do not give this code to anyone, even if they say they are from Telegram! Its valid for 30 sec.`);
                return this.success(res, { message: "Otp sent successfully" });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    static verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, Locals_1.default.config().appSecret);
            return decoded; // Return the decoded payload
        }
        catch (error) {
            console.error('Token verification failed:', error.message);
            throw new Error('Invalid or expired token');
        }
    }
    verifyotp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, token } = req.body;
                console.log(req.body, "loesh req.body");
                const fullotp = otp;
                const userExtract = AuthController.verifyToken(token);
                const user = yield User_1.User.findOne({
                    username: userExtract.username,
                    // role: RoleType.user,
                });
                if (!user) {
                    return this.fail(res, 'User does not exixts!');
                }
                if (user.role !== Role_1.RoleType.admin && !user.isLogin) {
                    return this.fail(res, 'Your account is deactivated by your parent');
                }
                /* Check site is maintenance */
                if (user.role !== Role_1.RoleType.admin) {
                    const message = (0, maintenance_1.checkMaintenance)();
                    if (message) {
                        return this.fail(res, message.message);
                    }
                }
                console.log(user, "user");
                if (user.otp == parseInt(fullotp)) {
                    const token = AuthController.token(user);
                    user.refreshToken = bcrypt_nodejs_1.default.hashSync(user.username);
                    user.sessionId = Date.now();
                    // const findMessage: any = await Setting.findOne({ name: "img_desktop" }, { value: 1 })
                    // @ts-ignore
                    // .cache(0, 'img_desktop')
                    // const findMessage2: any = await Setting.findOne({ name: "img_mobile" }, { value: 1 })
                    // @ts-ignore
                    // .cache(0, 'img_mobile')
                    yield user.save();
                    return this.success(res, {
                        token,
                        refreshToken: user.refreshToken,
                        username: user.username,
                        role: user.role,
                        _id: user._id,
                        sessionId: user.sessionId,
                        isDemo: user.isDemo,
                        authStatus: user.auth_method,
                        // img_desktop: findMessage?.value,
                        // img_mobile: findMessage2?.value
                    });
                }
                return this.fail(res, 'Invalid otp');
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    telegramwebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = req.body; // Get the update sent by Telegram
            if (update.message) {
                const chatId = update.message.chat.id;
                const text = update.message.text || "No text";
                if (text.includes("/connect")) {
                    const replaceData = text.replace("/connect ", "");
                    const user = yield User_1.User.findOne({ tgram_ukey: replaceData });
                    if (user) {
                        yield User_1.User.updateOne({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { auth_method: 1, telegram_chat_id: chatId } });
                        user_socket_1.default.logout({
                            role: user.role,
                            sessionId: '123',
                            _id: user._id,
                        });
                        yield this.sendMessage(chatId, `2-Step Verification is enabled, Now you can use this bot to login into your account.`);
                    }
                    else {
                        yield this.sendMessage(chatId, `Invalid Auth code`);
                    }
                }
                else if (text.includes("/start")) {
                    yield this.sendMessage(chatId, `Hey! You are 1 step away from 2-Step Verification, Now please proceed for further step: /connect your_id to enable it for your account.`);
                }
                else {
                    yield this.sendMessage(chatId, `Please send correct auth code`);
                }
            }
            return this.success(res, 'Webhook registered successfully!');
        });
    }
    sendMessage(chatId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const BOT_TOKEN = "8508208036:AAH-39949zXx4M1_YNEcAypSCza4BPDHWuM";
            const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
            try {
                const response = yield axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
                    chat_id: chatId,
                    text: text,
                });
                console.log("Message sent:", response.data);
            }
            catch (error) {
                console.error("Error sending message:", error.response.data);
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map