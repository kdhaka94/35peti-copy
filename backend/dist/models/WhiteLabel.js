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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteLabel = exports.whiteLabelSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.whiteLabelSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    domain: { type: String, required: true, unique: true, lowercase: true },
    companyName: String,
    logoUrl: String,
    faviconUrl: String,
    primaryColor: { type: String, default: '#007bff' },
    secondaryColor: { type: String, default: '#6c757d' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#212529' },
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    customCSS: String,
    customJS: String,
    headerHTML: String,
    footerHTML: String,
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});
exports.WhiteLabel = mongoose_1.default.model('WhiteLabel', exports.whiteLabelSchema);
//# sourceMappingURL=WhiteLabel.js.map