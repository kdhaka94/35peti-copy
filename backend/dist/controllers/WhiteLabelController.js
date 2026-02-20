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
exports.WhiteLabelController = void 0;
const WhiteLabel_1 = require("../models/WhiteLabel");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const ApiController_1 = require("./ApiController");
class WhiteLabelController extends ApiController_1.ApiController {
    constructor() {
        super();
        // Super admin creates a white-label setup for an admin user
        this.createWhiteLabel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                // Only super admin (sadmin) can create white-labels for other users
                if (currentUser.role !== Role_1.RoleType.sadmin) {
                    return this.unauthorized(res, 'Only super admin can create white-label setups');
                }
                const { userId, // The admin user for whom we're creating white-label
                domain, companyName, logoUrl, faviconUrl, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, customCSS, customJS, headerHTML, footerHTML } = req.body;
                // Validate that the target user exists and is an admin
                const targetUser = yield User_1.User.findById(userId);
                if (!targetUser) {
                    return this.fail(res, 'User not found');
                }
                if (targetUser.role !== Role_1.RoleType.admin) {
                    return this.fail(res, 'White-label can only be created for admin users');
                }
                // Check if domain already exists
                const existingDomain = yield WhiteLabel_1.WhiteLabel.findOne({ domain: domain.toLowerCase() });
                if (existingDomain) {
                    return this.fail(res, 'Domain already exists');
                }
                // Create the white-label entry
                const whiteLabelData = {
                    userId: targetUser._id,
                    domain: domain.toLowerCase(),
                    companyName,
                    logoUrl,
                    faviconUrl,
                    primaryColor,
                    secondaryColor,
                    backgroundColor,
                    textColor,
                    fontFamily,
                    customCSS,
                    customJS,
                    headerHTML,
                    footerHTML
                };
                const whiteLabel = new WhiteLabel_1.WhiteLabel(whiteLabelData);
                yield whiteLabel.save();
                return this.success(res, { whiteLabel }, 'White-label setup created successfully');
            }
            catch (error) {
                return this.fail(res, error.message || 'Error creating white-label setup');
            }
        });
        // Admin can update their own white-label settings
        this.updateWhiteLabel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                const { domain, companyName, logoUrl, faviconUrl, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, customCSS, customJS, headerHTML, footerHTML, isActive } = req.body;
                // Find the white-label for this user
                let whiteLabel = yield WhiteLabel_1.WhiteLabel.findOne({ userId: currentUser._id });
                if (!whiteLabel) {
                    return this.fail(res, 'White-label setup not found for your account');
                }
                // Check if domain already exists for another user (if changing domain)
                if (domain && domain.toLowerCase() !== whiteLabel.domain) {
                    const existingDomain = yield WhiteLabel_1.WhiteLabel.findOne({
                        domain: domain.toLowerCase(),
                        userId: { $ne: currentUser._id }
                    });
                    if (existingDomain) {
                        return this.fail(res, 'Domain already exists');
                    }
                }
                // Update the white-label settings
                const updateData = {
                    domain: domain ? domain.toLowerCase() : whiteLabel.domain,
                    companyName: companyName !== undefined ? companyName : whiteLabel.companyName,
                    logoUrl: logoUrl !== undefined ? logoUrl : whiteLabel.logoUrl,
                    faviconUrl: faviconUrl !== undefined ? faviconUrl : whiteLabel.faviconUrl,
                    primaryColor: primaryColor !== undefined ? primaryColor : whiteLabel.primaryColor,
                    secondaryColor: secondaryColor !== undefined ? secondaryColor : whiteLabel.secondaryColor,
                    backgroundColor: backgroundColor !== undefined ? backgroundColor : whiteLabel.backgroundColor,
                    textColor: textColor !== undefined ? textColor : whiteLabel.textColor,
                    fontFamily: fontFamily !== undefined ? fontFamily : whiteLabel.fontFamily,
                    customCSS: customCSS !== undefined ? customCSS : whiteLabel.customCSS,
                    customJS: customJS !== undefined ? customJS : whiteLabel.customJS,
                    headerHTML: headerHTML !== undefined ? headerHTML : whiteLabel.headerHTML,
                    footerHTML: footerHTML !== undefined ? footerHTML : whiteLabel.footerHTML,
                    isActive: isActive !== undefined ? isActive : whiteLabel.isActive
                };
                whiteLabel = yield WhiteLabel_1.WhiteLabel.findOneAndUpdate({ userId: currentUser._id }, { $set: updateData }, { new: true });
                return this.success(res, { whiteLabel }, 'White-label setup updated successfully');
            }
            catch (error) {
                return this.fail(res, error.message || 'Error updating white-label setup');
            }
        });
        // Get white-label settings by domain (for frontend to load correct theme)
        this.getWhiteLabelByDomain = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { domain } = req.params;
                const whiteLabel = yield WhiteLabel_1.WhiteLabel.findOne({
                    domain: domain.toLowerCase(),
                    isActive: true
                }).populate('userId', 'username role');
                if (!whiteLabel) {
                    // Return default settings if no white-label is configured
                    return this.success(res, {
                        domain: domain,
                        companyName: 'Default Platform',
                        logoUrl: '/imgs/logo.png',
                        faviconUrl: '/favicon.ico',
                        primaryColor: '#ffffff',
                        secondaryColor: '#6c757d',
                        backgroundColor: '#ffffff',
                        textColor: '#212529',
                        fontFamily: 'Arial, sans-serif',
                        customCSS: '',
                        customJS: '',
                        headerHTML: '',
                        footerHTML: ''
                    });
                }
                return this.success(res, whiteLabel);
            }
            catch (error) {
                return this.fail(res, error.message || 'Error fetching white-label settings');
            }
        });
        // Get white-label settings for current user (admin view)
        this.getCurrentUserWhiteLabel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                let whiteLabel = yield WhiteLabel_1.WhiteLabel.findOne({ userId: currentUser._id });
                console.log(whiteLabel, "whtt");
                if (!whiteLabel) {
                    // Create default white-label if it doesn't exist
                    whiteLabel = new WhiteLabel_1.WhiteLabel({
                        userId: currentUser._id,
                        domain: `${currentUser.username}.default-domain.com`,
                        companyName: `${currentUser.username}'s Platform`,
                        logoUrl: '/imgs/logo.png',
                        faviconUrl: '/favicon.ico',
                        primaryColor: '#0088ec',
                        secondaryColor: '#6c757d',
                        backgroundColor: '#ffffff',
                        textColor: '#212529',
                        fontFamily: 'Arial, sans-serif'
                    });
                    yield whiteLabel.save();
                }
                // return this.success(res, whiteLabel)
                return this.success(res, { whiteLabel });
            }
            catch (error) {
                return this.fail(res, error.message || 'Error fetching white-label settings');
            }
        });
        // Get all white-label setups (for super admin view)
        this.getAllWhiteLabels = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                // Only super admin can view all white-labels
                if (currentUser.role !== Role_1.RoleType.sadmin) {
                    return this.unauthorized(res, 'Only super admin can view all white-label setups');
                }
                const whiteLabels = yield WhiteLabel_1.WhiteLabel.find().populate('userId', 'username role fullName');
                return this.success(res, { whiteLabels });
            }
            catch (error) {
                return this.fail(res, error.message || 'Error fetching white-label setups');
            }
        });
        // Toggle white-label active status (for super admin)
        this.toggleWhiteLabelStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                // Only super admin can toggle white-label status
                if (currentUser.role !== Role_1.RoleType.sadmin) {
                    return this.unauthorized(res, 'Only super admin can toggle white-label status');
                }
                const { whiteLabelId } = req.params;
                const { isActive } = req.body;
                const whiteLabel = yield WhiteLabel_1.WhiteLabel.findByIdAndUpdate(whiteLabelId, { isActive }, { new: true });
                if (!whiteLabel) {
                    return this.fail(res, 'White-label setup not found');
                }
                return this.success(res, { whiteLabel }, `White-label ${isActive ? 'activated' : 'deactivated'} successfully`);
            }
            catch (error) {
                return this.fail(res, error.message || 'Error toggling white-label status');
            }
        });
        // Get white-label by user ID (for admin to view their own white-label)
        this.getWhiteLabelByUserId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const whiteLabel = yield WhiteLabel_1.WhiteLabel.findOne({ userId }).populate('userId', 'username role fullName');
                if (!whiteLabel) {
                    return this.fail(res, 'White-label not found for this user');
                }
                return this.success(res, { whiteLabel });
            }
            catch (error) {
                return this.fail(res, error.message || 'Error fetching white-label');
            }
        });
    }
}
exports.WhiteLabelController = WhiteLabelController;
//# sourceMappingURL=WhiteLabelController.js.map