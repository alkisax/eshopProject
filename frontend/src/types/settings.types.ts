// frontend\src\types\settings.types.ts
export type MenuItem = {
  label: string;
  url: string;
};

export type Settings = {
  branding?: {
    themeLogo?: string;
    headerFooterLogo?: string;
    heroImage?: string;
    isHeroImageActive?: boolean;
    themeSelector?: ("TRUE" | "FALSE")[];
  };
  shopOptions?: {
    isOpen?: boolean;
    isAiProfanity?: boolean;
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
    themeColor3?: string;
    themeColor4?: string;
    themeColor5?: string;
    menuItems?: MenuItem[];
    btnImage1?: string;
    btnImage2?: string;
    btnImage3?: string;
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
