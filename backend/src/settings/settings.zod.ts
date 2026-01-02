// backend/src/settings/settings.zod.ts
import { z } from 'zod';

export const adminNotificationsSchema = z.object({
  salesNotificationsEnabled: z.boolean().optional(),
  adminEmail: z.email().optional(),
});

export const brandingSchema = z.object({
  themeLogo: z.url().optional(),
  headerFooterLogo: z.url().optional(),
  heroImage: z.url().optional(),
  isHeroImageActive: z.boolean().optional(),
});

export const homeTextsSchema = z.object({
  homeText1: z.string().optional(),
  homeText2: z.string().optional(),
  homeText3: z.string().optional(),
});

export const companyInfoSchema = z.object({
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
});

export const socialLinksSchema = z.object({
  facebook: z.url().optional(),
  instagram: z.url().optional(),
  etsy: z.url().optional(),
  tiktok: z.url().optional(),
});

export const staticPagesSchema = z.object({
  aboutUs: z.string().optional(),
  returnPolicy: z.string().optional(),
  paymentMethods: z.string().optional(),
  shippingMethods: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsOfUse: z.string().optional(),
});

export const themeSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export const emailTemplateSchema = z.object({
  subject: z.string().optional(),
  body: z.string().optional(),
});

export const emailTemplatesSchema = z.object({
  orderConfirmed: emailTemplateSchema.optional(),
  orderShipped: emailTemplateSchema.optional(),
});

export const updateSettingsSchema = z.object({
  adminNotifications: adminNotificationsSchema.optional(),
  branding: brandingSchema.optional(),
  homeTexts: homeTextsSchema.optional(),
  companyInfo: companyInfoSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
  staticPages: staticPagesSchema.optional(),
  theme: themeSchema.optional(),
  emailTemplates: emailTemplatesSchema.optional(),
});

export const createSettingsSchema = z.object({
  adminNotifications: adminNotificationsSchema.optional(),
  branding: brandingSchema.optional(),
  homeTexts: homeTextsSchema.optional(),
  companyInfo: companyInfoSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
  staticPages: staticPagesSchema.optional(),
  theme: themeSchema.optional(),
  emailTemplates: emailTemplatesSchema.optional(),
});
