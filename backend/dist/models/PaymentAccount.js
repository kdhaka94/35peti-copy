"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAccount = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const PaymentAccountSchema = new mongoose_2.Schema({
    bankName: String,
    upiId: String,
    upiName: String,
    upiQrCode: String,
    ifscCode: String,
    accountNumber: String,
    accountHolderName: String,
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});
const PaymentAccount = (0, mongoose_2.model)('PaymentAccount', PaymentAccountSchema);
exports.PaymentAccount = PaymentAccount;
//# sourceMappingURL=PaymentAccount.js.map