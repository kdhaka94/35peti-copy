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
exports.TodoController = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const Setting_1 = require("../models/Setting");
const ApiController_1 = require("./ApiController");
const Payments_1 = require("../models/Payments");
class TodoController extends ApiController_1.ApiController {
    constructor() {
        super(...arguments);
        this.excuteCmd = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const pathURL = path_1.default.join(__dirname, '../../');
            (0, child_process_1.exec)(`${pathURL}excute.sh`, function (err, stdout, stderr) {
                //   // handle err, stdout, stderr
                console.log(err, stdout);
            });
            return this.success(res, { path: pathURL });
        });
        this.saveSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pathURL = path_1.default.join(__dirname, '../../');
                const { settingList } = req.body;
                const headerMessageJson = {
                    headerMessageLink: '',
                    headerMessage: '',
                };
                settingList.map((setting) => __awaiter(this, void 0, void 0, function* () {
                    if (setting.name === 'userMaintenanceMessage' && setting.active) {
                        (0, promises_1.writeFile)(`${pathURL}public/maintenance.json`, `{"message":"${setting.value}"}`, {
                            flag: 'w',
                        });
                    }
                    else if (setting.name === 'userMaintenanceMessage') {
                        if ((0, fs_1.existsSync)(`${pathURL}public/maintenance.json`)) {
                            (0, fs_1.unlinkSync)(`${pathURL}public/maintenance.json`);
                        }
                    }
                    if (setting.name === 'adminMessage' || setting.name === 'userMessage') {
                        (0, promises_1.writeFile)(`${pathURL}public/${setting.name}.json`, `{"message":"${setting.value}"}`, {
                            flag: 'w',
                        });
                    }
                    if (setting.name === 'headerMessage' || setting.name === 'headerMessageLink') {
                        headerMessageJson[setting.name] = setting.value;
                    }
                    yield Setting_1.Setting.findOneAndUpdate({ name: setting.name }, { $set: { value: setting.value, active: setting.active } });
                }));
                if (headerMessageJson.headerMessage) {
                    (0, promises_1.writeFile)(`${pathURL}public/headerMessage.json`, JSON.stringify(headerMessageJson), {
                        flag: 'w',
                    });
                }
                return this.success(res, {}, 'Setting Saved');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        // --- Payment Account CRUD (multi-account) ---
        this.createPaymentAccount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const userId = user === null || user === void 0 ? void 0 : user._id;
                const count = yield Payments_1.PaymentAccount.countDocuments({ userId });
                if (count >= 15) {
                    return this.fail(res, 'Maximum 15 accounts allowed. Delete an existing account first.');
                }
                const { bankName, accountHolderName, accountNumber, ifscCode, upiId, upiName, isActive, accountType, walletAddress, network } = req.body;
                const accountData = {
                    userId,
                    accountType: accountType || 'bank',
                    bankName,
                    accountHolderName,
                    accountNumber,
                    ifscCode,
                    upiId,
                    upiName,
                    walletAddress,
                    network,
                    isActive: isActive !== undefined ? isActive : true,
                };
                if (req.file) {
                    accountData.upiQrCode = req.file.path;
                }
                const account = yield Payments_1.PaymentAccount.create(accountData);
                return this.success(res, { account }, 'Account added successfully');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.getPaymentAccounts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const accounts = yield Payments_1.PaymentAccount.find({ userId: user === null || user === void 0 ? void 0 : user._id }).sort({ createdAt: -1 });
                return this.success(res, { accounts });
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.getActivePaymentAccounts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const accounts = yield Payments_1.PaymentAccount.find({ userId: user === null || user === void 0 ? void 0 : user.parentId, isActive: true }).sort({ createdAt: -1 });
                return this.success(res, { accounts });
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.updatePaymentAccount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { bankName, accountHolderName, accountNumber, ifscCode, upiId, upiName, isActive, accountType, walletAddress, network } = req.body;
                const account = yield Payments_1.PaymentAccount.findById(id);
                if (!account)
                    return this.fail(res, 'Account not found');
                if (accountType !== undefined)
                    account.accountType = accountType;
                if (bankName !== undefined)
                    account.bankName = bankName;
                if (accountHolderName !== undefined)
                    account.accountHolderName = accountHolderName;
                if (accountNumber !== undefined)
                    account.accountNumber = accountNumber;
                if (ifscCode !== undefined)
                    account.ifscCode = ifscCode;
                if (upiId !== undefined)
                    account.upiId = upiId;
                if (upiName !== undefined)
                    account.upiName = upiName;
                if (walletAddress !== undefined)
                    account.walletAddress = walletAddress;
                if (network !== undefined)
                    account.network = network;
                if (isActive !== undefined)
                    account.isActive = isActive;
                if (req.file) {
                    // Delete old QR file
                    if (account.upiQrCode && (0, fs_1.existsSync)(account.upiQrCode)) {
                        (0, fs_1.unlinkSync)(account.upiQrCode);
                    }
                    account.upiQrCode = req.file.path;
                }
                yield account.save();
                return this.success(res, { account }, 'Account updated successfully');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.deletePaymentAccount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const account = yield Payments_1.PaymentAccount.findById(id);
                if (!account)
                    return this.fail(res, 'Account not found');
                if (account.upiQrCode && (0, fs_1.existsSync)(account.upiQrCode)) {
                    (0, fs_1.unlinkSync)(account.upiQrCode);
                }
                yield Payments_1.PaymentAccount.findByIdAndDelete(id);
                return this.success(res, {}, 'Account deleted successfully');
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        this.togglePaymentAccountStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const account = yield Payments_1.PaymentAccount.findById(id);
                if (!account)
                    return this.fail(res, 'Account not found');
                account.isActive = !account.isActive;
                yield account.save();
                return this.success(res, { account }, `Account ${account.isActive ? 'activated' : 'deactivated'}`);
            }
            catch (e) {
                return this.fail(res, e.message);
            }
        });
        // --- Existing settings methods ---
        this.settingsList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const settings = yield Setting_1.Setting.find({});
            return this.success(res, { settings });
        });
        this.getSettingList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let settings = yield Setting_1.Setting.find({});
            const settingsData = {};
            //@ts-expect-error
            settings.map((setting) => {
                settingsData[setting.name] = setting.value;
            });
            return this.success(res, { settings: settingsData });
        });
    }
}
exports.TodoController = TodoController;
//# sourceMappingURL=TodoController.js.map