// backend\src\settings\settings.types.ts
import type { Document } from 'mongoose';

export interface AdminNotificationsSettings {
  salesNotificationsEnabled?: boolean;
  adminEmail?: string;
}

export interface BrandingSettings {
  themeLogo?: string;
  headerFooterLogo?: string;
}

export interface HomeTextsSettings {
  homeText1?: string;
  homeText2?: string;
  homeText3?: string;
}

export interface CompanyInfoSettings {
  companyName?: string;
  vatNumber?: string; // ΑΦΜ
  address?: string;
  phone?: string;
  email?: string;
}

export interface SocialLinksSettings {
  facebook?: string;
  instagram?: string;
  etsy?: string;
  tiktok?: string;
}

export interface StaticPagesSettings {
  aboutUs?: string;
  returnPolicy?: string;
  paymentMethods?: string;
  shippingMethods?: string;
  privacyPolicy?: string;
  termsOfUse?: string;
}

export interface ThemeSettings {
  primaryColor?: string;   // π.χ. '#008482'
  secondaryColor?: string; // π.χ. '#a6ddd8'
}

export interface SettingsType extends Document {
  key: string; // π.χ. 'global'
  adminNotifications: AdminNotificationsSettings;
  branding: BrandingSettings;
  homeTexts: HomeTextsSettings;
  companyInfo: CompanyInfoSettings;
  socialLinks: SocialLinksSettings;
  staticPages: StaticPagesSettings;
  theme: ThemeSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SettingsUpdateInput = {
  adminNotifications?: Partial<AdminNotificationsSettings>;
  branding?: Partial<BrandingSettings>;
  homeTexts?: Partial<HomeTextsSettings>;
  companyInfo?: Partial<CompanyInfoSettings>;
  socialLinks?: Partial<SocialLinksSettings>;
  staticPages?: Partial<StaticPagesSettings>;
  theme?: Partial<ThemeSettings>;
};
