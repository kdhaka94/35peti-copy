"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAccount = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const PaymentAccountSchema = new mongoose_2.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    accountType: { type: String, enum: ['bank', 'usdt'], default: 'bank' },
    bankName: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    upiId: { type: String, trim: true },
    upiName: { type: String, trim: true },
    upiQrCode: { type: String, default: null },
    walletAddress: { type: String, trim: true },
    network: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});
const PaymentAccount = (0, mongoose_2.model)('PaymentAccount', PaymentAccountSchema);
exports.PaymentAccount = PaymentAccount;
//# sourceMappingURL=Payments.js.map