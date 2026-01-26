// backend/src/settings/models/settings.model.ts
import mongoose from 'mongoose';
import type { SettingsType } from './settings.types';

const Schema = mongoose.Schema;

const adminNotificationsSchema = new Schema(
  {
    salesNotificationsEnabled: {
      type: Boolean,
      default: false,
    },
    adminEmail: {
      type: String,
    },
  },
  { _id: false },
);

const brandingSchema = new Schema(
  {
    themeLogo: { type: String },
    headerFooterLogo: { type: String },
    heroImage: { type: String },
    isHeroImageActive: { type: Boolean, default: false },
    themeSelector: {
      type: [String],
      enum: ['TRUE', 'FALSE'],
      default: ['FALSE'],
    },
  },
  { _id: false },
);

const homeTextsSchema = new Schema(
  {
    homeText1: { type: String },
    homeText2: { type: String },
    homeText3: { type: String },
  },
  { _id: false },
);

const companyInfoSchema = new Schema(
  {
    companyName: { type: String },
    vatNumber: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    irisBankQR: { type: String },
  },
  { _id: false },
);

const socialLinksSchema = new Schema(
  {
    facebook: { type: String },
    instagram: { type: String },
    etsy: { type: String },
    tiktok: { type: String },
  },
  { _id: false },
);

const staticPagesSchema = new Schema(
  {
    aboutUs: { type: String },
    returnPolicy: { type: String },
    paymentMethods: { type: String },
    shippingMethods: { type: String },
    privacyPolicy: { type: String },
    termsOfUse: { type: String },
  },
  { _id: false },
);

const menuItemSchema = new Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const themeSchema = new Schema(
  {
    primaryColor: { type: String },
    secondaryColor: { type: String },
    themeColor3: { type: String },
    themeColor4: { type: String },
    themeColor5: { type: String },

    menuItems: {
      type: [menuItemSchema],
      default: undefined,
    },

    btnImage1: { type: String },
    btnImage2: { type: String },
    btnImage3: { type: String },
  },
  { _id: false },
);

const emailTemplateSchema = new Schema(
  {
    subject: { type: String },
    body: { type: String },
  },
  { _id: false },
);

const emailTemplatesSchema = new Schema(
  {
    orderConfirmed: { type: emailTemplateSchema, default: {} },
    orderShipped: { type: emailTemplateSchema, default: {} },
  },
  { _id: false },
);

const shopOptionsSchema = new Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },
    isAiProfanity: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    adminNotifications: {
      type: adminNotificationsSchema,
      default: {},
    },
    branding: {
      type: brandingSchema,
      default: {},
    },

    shopOptions: {
      type: shopOptionsSchema,
      default: {},
    },

    homeTexts: {
      type: homeTextsSchema,
      default: {},
    },

    companyInfo: {
      type: companyInfoSchema,
      default: {},
    },

    socialLinks: {
      type: socialLinksSchema,
      default: {},
    },

    staticPages: {
      type: staticPagesSchema,
      default: {},
    },

    theme: {
      type: themeSchema,
      default: {},
    },

    emailTemplates: {
      type: emailTemplatesSchema,
      default: {},
    },
  },
  {
    collection: 'Settings',
    timestamps: true,
  },
);

export default mongoose.model<SettingsType>('Settings', settingsSchema);
