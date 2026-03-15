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
Object.defineProperty(exports, "__esModule", { value: true });
exports.whiteLabelMiddleware = void 0;
const WhiteLabel_1 = require("../models/WhiteLabel");
const whiteLabelMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the host from the request
        const host = req.get('Host') || req.headers.host;
        if (!host) {
            // If no host header, continue without white-label
            return next();
        }
        // Extract just the domain (without port if present)
        const domain = host.split(':')[0]; // Remove port if present
        // Look up white-label settings for this domain
        const whiteLabel = yield WhiteLabel_1.WhiteLabel.findOne({
            domain: domain.toLowerCase(),
            isActive: true
        }).populate('userId', 'username role');
        if (whiteLabel) {
            // Store white-label info in request for later use
            req.whiteLabel = whiteLabel;
        }
        next();
    }
    catch (error) {
        console.error('Error in white-label middleware:', error);
        // Continue without white-label if there's an error
        next();
    }
});
exports.whiteLabelMiddleware = whiteLabelMiddleware;
//# sourceMappingURL=WhiteLabelMiddleware.js.map