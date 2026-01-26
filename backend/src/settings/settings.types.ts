// backend\src\settings\settings.types.ts
import type { Document } from 'mongoose';

export interface AdminNotificationsSettings {
  salesNotificationsEnabled?: boolean;
  adminEmail?: string;
}

export type ThemeSelectorMode = 'TRUE' | 'FALSE';

export interface BrandingSettings {
  themeLogo?: string;
  headerFooterLogo?: string;
  heroImage?: string;
  isHeroImageActive?: boolean;
  themeSelector?: ThemeSelectorMode[];
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
  irisBankQR?: string;
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
  primaryColor?: string; // π.χ. '#008482'
  secondaryColor?: string; // π.χ. '#a6ddd8'
  themeColor3?: string;
  themeColor4?: string;
  themeColor5?: string;

  menuItems?: {
    label: string;
    url: string;
  }[];

  btnImage1?: string;
  btnImage2?: string;
  btnImage3?: string;
}

export interface ShopOptionsSettings {
  isOpen?: boolean;
  isAiProfanity?: boolean;
}

export interface EmailTemplate {
  subject?: string;
  body?: string;
}

export interface EmailTemplatesSettings {
  orderConfirmed?: EmailTemplate;
  orderShipped?: EmailTemplate;
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
  shopOptions?: ShopOptionsSettings;
  emailTemplates?: EmailTemplatesSettings;
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
  shopOptions?: Partial<ShopOptionsSettings>;
  emailTemplates?: Partial<EmailTemplatesSettings>;
};
