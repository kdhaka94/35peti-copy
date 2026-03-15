"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteLabelRoutes = void 0;
const express_1 = require("express");
const WhiteLabelController_1 = require("../controllers/WhiteLabelController");
const Passport_1 = __importDefault(require("../passport/Passport"));
const Http_1 = __importDefault(require("../middlewares/Http"));
class WhiteLabelRoutes {
    constructor() {
        this.whiteLabelController = new WhiteLabelController_1.WhiteLabelController();
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // Super admin routes
        this.router.post('/create-white-label', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.createWhiteLabel);
        this.router.get('/all-white-labels', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.getAllWhiteLabels);
        this.router.put('/toggle-white-label/:whiteLabelId', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.toggleWhiteLabelStatus);
        // Admin routes (for current user's white-label)
        this.router.get('/my-white-label', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.getCurrentUserWhiteLabel);
        this.router.put('/update-white-label', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.updateWhiteLabel);
        // Public route to get white-label settings by domain
        // this.router.get(
        //   '/domain/:domain',
        //   this.whiteLabelController.getWhiteLabelByDomain
        // )
        // Get white-label by user ID
        this.router.get('/user/:userId', Passport_1.default.authenticateJWT, Http_1.default.maintenance, this.whiteLabelController.getWhiteLabelByUserId);
    }
}
exports.WhiteLabelRoutes = WhiteLabelRoutes;
//# sourceMappingURL=white-label.js.map