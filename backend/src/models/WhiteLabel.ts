import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IWhiteLabel {
  userId: mongoose.Types.ObjectId; // Reference to the admin user who owns this white-label
  domain: string; // Custom domain for this white-label
  mode: string; // Custom domain for this white-label
  companyName?: string; // Company name for this white-label
  logoUrl?: string; // URL to the logo
  logoImage?: string; // URL to the logo
  faviconUrl?: string; // URL to the favicon
  primaryColor?: string; // Primary theme color
  secondaryColor?: string; // Secondary theme color
  backgroundColor?: string; // Background color
  textColor?: string; // Text color
  fontFamily?: string; // Font family for the theme
  customCSS?: string; // Custom CSS for advanced styling
  customJS?: string; // Custom JavaScript
  headerHTML?: string; // Custom HTML for header
  footerHTML?: string; // Custom HTML for footer
  isActive: boolean; // Whether this white-label is active
  createdAt: Date;
  updatedAt: Date;
}

export interface IWhiteLabelModel extends IWhiteLabel, Document {}

export const whiteLabelSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    domain: { type: String, required: true, unique: true, lowercase: true },
    mode: { type: String },
    companyName: String,
    logoUrl: String,
    logoImage: String,
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
  },
  {
    timestamps: true,
  }
)

export const WhiteLabel = mongoose.model<IWhiteLabelModel>('WhiteLabel', whiteLabelSchema)