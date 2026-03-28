import { Request, Response } from 'express'
import { WhiteLabel, IWhiteLabelModel } from '../models/WhiteLabel'
import { User } from '../models/User'
import { RoleType } from '../models/Role'
import { ApiController } from './ApiController'

export class WhiteLabelController extends ApiController {
  constructor() {
    super()
  }

  // Super admin creates a white-label setup for an admin user
  createWhiteLabel = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      
      // Only super admin (sadmin) can create white-labels for other users
      if (currentUser.role !== RoleType.sadmin) {
        return this.unauthorized(res, 'Only super admin can create white-label setups')
      }

      const {
        userId, // The admin user for whom we're creating white-label
        domain,
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
        footerHTML,
        whatsappNumber
      } = req.body

      // Validate that the target user exists and is an admin
      const targetUser = await User.findById(userId)
      if (!targetUser) {
        return this.fail(res, 'User not found')
      }
      
      if (targetUser.role !== RoleType.admin) {
        return this.fail(res, 'White-label can only be created for admin users')
      }

      // Check if domain already exists
      const existingDomain = await WhiteLabel.findOne({ domain: domain.toLowerCase() })
      if (existingDomain) {
        return this.fail(res, 'Domain already exists')
      }

      // Create the white-label entry
      const whiteLabelData: Partial<IWhiteLabelModel> = {
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
        footerHTML,
        whatsappNumber
      }

      const whiteLabel = new WhiteLabel(whiteLabelData)
      await whiteLabel.save()

      return this.success(res, { whiteLabel }, 'White-label setup created successfully')
    } catch (error: any) {
      return this.fail(res, error.message || 'Error creating white-label setup')
    }
  }

  // Admin can update their own white-label settings
  updateWhiteLabel = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user

      const {
        domain,
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
        footerHTML,
        whatsappNumber,
        isActive
      } = req.body

      // Find the white-label for this user
      let whiteLabel = await WhiteLabel.findOne({ userId: currentUser._id })

      if (!whiteLabel) {
        return this.fail(res, 'White-label setup not found for your account')
      }

      // Check if domain already exists for another user (if changing domain)
      if (domain && domain.toLowerCase() !== whiteLabel.domain) {
        const existingDomain = await WhiteLabel.findOne({ 
          domain: domain.toLowerCase(), 
          userId: { $ne: currentUser._id } 
        })
        if (existingDomain) {
          return this.fail(res, 'Domain already exists')
        }
      }

      // Update the white-label settings
      const updateData: Partial<IWhiteLabelModel> = {
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
        whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : whiteLabel.whatsappNumber,
        isActive: isActive !== undefined ? isActive : whiteLabel.isActive
      }

      whiteLabel = await WhiteLabel.findOneAndUpdate(
        { userId: currentUser._id },
        { $set: updateData },
        { new: true }
      )

      return this.success(res, { whiteLabel }, 'White-label setup updated successfully')
    } catch (error: any) {
      return this.fail(res, error.message || 'Error updating white-label setup')
    }
  }

  // Get white-label settings by domain (for frontend to load correct theme)
  getWhiteLabelByDomain = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { domain } = req.params

      const whiteLabel = await WhiteLabel.findOne({ 
        domain: domain.toLowerCase(), 
        isActive: true 
      }).populate('userId', 'username role')

      if (!whiteLabel) {
        // Return default settings if no white-label is configured
        return this.success(res, {
          domain: domain,
          companyName: 'Default Platform',
          mode:"",
          logoUrl: '/imgs/logo.png',
          logoImage:"",
          faviconUrl: '/favicon.ico',
          primaryColor: '#ffffff',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          textColor: '#212529',
          fontFamily: 'Arial, sans-serif',
          customCSS: '',
          customJS: '',
          headerHTML: '',
          footerHTML: '',
          whatsappNumber: ''
        })
      }

      return this.success(res, whiteLabel)
    } catch (error: any) {
      return this.fail(res, error.message || 'Error fetching white-label settings')
    }
  }

  // Get white-label settings for current user (admin view)
  getCurrentUserWhiteLabel = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user

      let whiteLabel = await WhiteLabel.findOne({ userId: currentUser._id })

      console.log(whiteLabel ,"whtt")

      if (!whiteLabel) {
        // Create default white-label if it doesn't exist
        whiteLabel = new WhiteLabel({
          userId: currentUser._id,
          domain: `${currentUser.username}.default-domain.com`,
          companyName: `${currentUser.username}'s Platform`,
          logoUrl: '/imgs/logo.png',
          faviconUrl: '/favicon.ico',
          primaryColor:  '#0088CC',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          textColor: '#212529',
          fontFamily: 'Arial, sans-serif',
          whatsappNumber: ''
        })
        await whiteLabel.save()
      }

      // return this.success(res, whiteLabel)
      return this.success(res, {whiteLabel})

    } catch (error: any) {
      return this.fail(res, error.message || 'Error fetching white-label settings')
    }
  }

  // Get all white-label setups (for super admin view)
  getAllWhiteLabels = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      
      // Only super admin can view all white-labels
      if (currentUser.role !== RoleType.sadmin) {
        return this.unauthorized(res, 'Only super admin can view all white-label setups')
      }

      const whiteLabels = await WhiteLabel.find().populate('userId', 'username role fullName')

      return this.success(res, { whiteLabels })
    } catch (error: any) {
      return this.fail(res, error.message || 'Error fetching white-label setups')
    }
  }

  // Toggle white-label active status (for super admin)
  toggleWhiteLabelStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user
      
      // Only super admin can toggle white-label status
      if (currentUser.role !== RoleType.sadmin) {
        return this.unauthorized(res, 'Only super admin can toggle white-label status')
      }

      const { whiteLabelId } = req.params
      const { isActive } = req.body

      const whiteLabel = await WhiteLabel.findByIdAndUpdate(
        whiteLabelId,
        { isActive },
        { new: true }
      )

      if (!whiteLabel) {
        return this.fail(res, 'White-label setup not found')
      }

      return this.success(res, { whiteLabel }, `White-label ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      return this.fail(res, error.message || 'Error toggling white-label status')
    }
  }

  // Get white-label by user ID (for admin to view their own white-label)
  getWhiteLabelByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params
      
      const whiteLabel = await WhiteLabel.findOne({ userId }).populate('userId', 'username role fullName')
      
      if (!whiteLabel) {
        return this.fail(res, 'White-label not found for this user')
      }

      return this.success(res, { whiteLabel })
    } catch (error: any) {
      return this.fail(res, error.message || 'Error fetching white-label')
    }
  }

  // Upload and update white-label logo image file
  uploadLogoImage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUser: any = req.user

      if (!req.file) {
        return this.fail(res, 'No logo image file provided')
      }

      const logoImagePath = req.file.path.replace(/\\/g, '/')

      const whiteLabel = await WhiteLabel.findOneAndUpdate(
        { userId: currentUser._id },
        { $set: { logoImage: logoImagePath } },
        { new: true }
      )

      if (!whiteLabel) {
        return this.fail(res, 'White-label setup not found for your account')
      }

      return this.success(res, { whiteLabel, logoImage: logoImagePath }, 'Logo uploaded successfully')
    } catch (error: any) {
      return this.fail(res, error.message || 'Error uploading logo')
    }
  }
}