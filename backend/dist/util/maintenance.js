"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = exports.checkMaintenance = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const checkMaintenance = () => {
    const filePath = path_1.default.join(__dirname, '../../', 'public/maintenance.json');
    if ((0, fs_1.existsSync)(filePath)) {
        const file = (0, fs_1.readFileSync)(filePath, {
            encoding: 'utf8',
            flag: 'r',
        });
        if (file) {
            const message = JSON.parse(file);
            return message;
        }
    }
    return null;
};
exports.checkMaintenance = checkMaintenance;
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
//# sourceMappingURL=maintenance.js.map