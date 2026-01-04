// frontend\src\types\settings.types.ts
export type Settings = {
  branding?: {
    themeLogo?: string;
    headerFooterLogo?: string;
    heroImage?: string;
    isHeroImageActive?: boolean;
    themeSelector?: ("TRUE" | "FALSE")[];
  };
  homeTexts?: {
    homeText1?: string;
    homeText2?: string;
    homeText3?: string;
  };
  companyInfo?: {
    companyName?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    irisBankQR?: string; 
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    etsy?: string;
    tiktok?: string;
  };
  staticPages?: {
    aboutUs?: string;
    returnPolicy?: string;
    paymentMethods?: string;
    shippingMethods?: string;
    privacyPolicy?: string;
    termsOfUse?: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  emailTemplates?: {
    orderConfirmed?: {
      subject?: string;
      body?: string;
    };
    orderShipped?: {
      subject?: string;
      body?: string;
    };
  };
};
