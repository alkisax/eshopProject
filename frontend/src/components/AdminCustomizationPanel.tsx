// frontend/src/components/settings_components/AdminCustomizationPanel.tsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useAppwriteUploader } from "../hooks/useAppwriteUploader";
import { VariablesContext } from "../context/VariablesContext";
import { useSettings } from "../context/SettingsContext";
import SettingsSection from "./settings_components/admin_settings_components/SettingsSection";
import BrandingSection from "./settings_components/admin_settings_components/BrandingSection";
import CompanyInfoSection from "./settings_components/admin_settings_components/CompanyInfoSection";
import SocialLinksSection from "./settings_components/admin_settings_components/SocialLinksSection";
import HomeTextsSection from "./settings_components/admin_settings_components/HomeTextsSection";
import StaticPagesSection from "./settings_components/admin_settings_components/StaticPagesSection";
import EmailTemplatesSection from "./settings_components/admin_settings_components/EmailTemplatesSection";
import ThemeSection from "./settings_components/admin_settings_components/ThemeSection";
import ShopOptionsSection from "./settings_components/admin_settings_components/ShopOptionsSection";

const AdminCustomizationPanel = () => {
  const { url } = useContext(VariablesContext);
  const { settings, refreshSettings } = useSettings();
  const { ready, uploadFile, listFiles, getFileUrl } = useAppwriteUploader();

  const [themeLogo, setThemeLogo] = useState(
    settings?.branding?.themeLogo || "",
  );
  const [headerFooterLogo, setHeaderFooterLogo] = useState(
    settings?.branding?.headerFooterLogo || "",
  );
  const [heroImage, setHeroImage] = useState(
    settings?.branding?.heroImage || "",
  );
  const [isHeroImageActive, setIsHeroImageActive] = useState(
    settings?.branding?.isHeroImageActive || false,
  );
  const [shopOptions, setShopOptions] = useState({
    isOpen: settings?.shopOptions?.isOpen ?? true,
    isAiProfanity: settings?.shopOptions?.isAiProfanity ?? false,
  });

  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [homeTexts, setHomeTexts] = useState({
    homeText1: settings?.homeTexts?.homeText1 || "",
    homeText2: settings?.homeTexts?.homeText2 || "",
    homeText3: settings?.homeTexts?.homeText3 || "",
  });
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: "",
    irisBankQR: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    facebook: settings?.socialLinks?.facebook || "",
    instagram: settings?.socialLinks?.instagram || "",
    etsy: settings?.socialLinks?.etsy || "",
    tiktok: settings?.socialLinks?.tiktok || "",
  });
  const [theme, setTheme] = useState({
    primaryColor: settings?.theme?.primaryColor || "#48C4Cf",
    secondaryColor: settings?.theme?.secondaryColor || "#FFD500",
    themeColor3: settings?.theme?.themeColor3 || "#933fff",
    themeColor4: settings?.theme?.themeColor4 || "#3f6cff",
    themeColor5: settings?.theme?.themeColor5 || "#34bf62",

    menuItems: settings?.theme?.menuItems || [],

    btnImage1: settings?.theme?.btnImage1 || "",
    btnImage2: settings?.theme?.btnImage2 || "",
    btnImage3: settings?.theme?.btnImage3 || "",
  });
  const [primaryDraft, setPrimaryDraft] = useState(
    settings?.theme?.primaryColor || "#48C4Cf",
  );
  const [secondaryDraft, setSecondaryDraft] = useState(
    settings?.theme?.secondaryColor || "#FFD500",
  );
  const [theme3Draft, setTheme3Draft] = useState(
    settings?.theme?.themeColor3 || "#933fff",
  );
  const [theme4Draft, setTheme4Draft] = useState(
    settings?.theme?.themeColor4 || "#3f6cff",
  );
  const [theme5Draft, setTheme5Draft] = useState(
    settings?.theme?.themeColor5 || "#34bf62",
  );

  const [staticPages, setStaticPages] = useState({
    aboutUs: "",
    returnPolicy: "",
    paymentMethods: "",
    shippingMethods: "",
    privacyPolicy: "",
    termsOfUse: "",
  });
  const [emailTemplates, setEmailTemplates] = useState({
    orderConfirmed: {
      subject: "",
      body: "",
    },
    orderShipped: {
      subject: "",
      body: "",
    },
  });
  const [themeSelector, setThemeSelector] = useState<("TRUE" | "FALSE")[]>(
    settings?.branding?.themeSelector || [],
  );

  // sync όταν αλλάξουν τα settings
  useEffect(() => {
    if (!settings) return;
    setThemeLogo(settings.branding?.themeLogo || "");
    setHeaderFooterLogo(settings.branding?.headerFooterLogo || "");
    setHeroImage(settings.branding?.heroImage || "");
    setIsHeroImageActive(settings.branding?.isHeroImageActive || false);
    setThemeSelector(settings.branding?.themeSelector || []);
    setShopOptions({
      isOpen: settings.shopOptions?.isOpen ?? true,
      isAiProfanity: settings.shopOptions?.isAiProfanity ?? false,
    });
    setTheme({
      primaryColor: settings.theme?.primaryColor || "#48C4Cf",
      secondaryColor: settings.theme?.secondaryColor || "#FFD500",
      themeColor3: settings.theme?.themeColor3 || "#933fff",
      themeColor4: settings.theme?.themeColor4 || "#3f6cff",
      themeColor5: settings.theme?.themeColor5 || "#34bf62",
      menuItems: settings.theme?.menuItems || [],
      btnImage1: settings.theme?.btnImage1 || "",
      btnImage2: settings.theme?.btnImage2 || "",
      btnImage3: settings.theme?.btnImage3 || "",
    });
    setPrimaryDraft(settings.theme?.primaryColor || "#48C4Cf");
    setSecondaryDraft(settings.theme?.secondaryColor || "#FFD500");
    setTheme3Draft(settings.theme?.themeColor3 || "#933fff");
    setTheme4Draft(settings.theme?.themeColor4 || "#3f6cff");
    setTheme5Draft(settings.theme?.themeColor5 || "#34bf62");
    setHomeTexts({
      homeText1: settings.homeTexts?.homeText1 || "",
      homeText2: settings.homeTexts?.homeText2 || "",
      homeText3: settings.homeTexts?.homeText3 || "",
    });
    setCompanyInfo({
      companyName: settings.companyInfo?.companyName || "",
      vatNumber: settings.companyInfo?.vatNumber || "",
      address: settings.companyInfo?.address || "",
      phone: settings.companyInfo?.phone || "",
      email: settings.companyInfo?.email || "",
      irisBankQR: settings.companyInfo?.irisBankQR || "",
    });
    setSocialLinks({
      facebook: settings.socialLinks?.facebook || "",
      instagram: settings.socialLinks?.instagram || "",
      etsy: settings.socialLinks?.etsy || "",
      tiktok: settings.socialLinks?.tiktok || "",
    });
    setStaticPages({
      aboutUs: settings.staticPages?.aboutUs || "",
      returnPolicy: settings.staticPages?.returnPolicy || "",
      paymentMethods: settings.staticPages?.paymentMethods || "",
      shippingMethods: settings.staticPages?.shippingMethods || "",
      privacyPolicy: settings.staticPages?.privacyPolicy || "",
      termsOfUse: settings.staticPages?.termsOfUse || "",
    });
    setEmailTemplates({
      orderConfirmed: {
        subject: settings?.emailTemplates?.orderConfirmed?.subject || "",
        body: settings?.emailTemplates?.orderConfirmed?.body || "",
      },
      orderShipped: {
        subject: settings?.emailTemplates?.orderShipped?.subject || "",
        body: settings?.emailTemplates?.orderShipped?.body || "",
      },
    });
  }, [settings]);

  // recent uploads
  useEffect(() => {
    const loadRecent = async () => {
      if (!ready) return;
      const res = await listFiles(1, 5);
      setRecentFiles(res.files.map((f) => getFileUrl(f.$id)));
    };
    loadRecent();
  }, [ready, listFiles, getFileUrl]);

  const uploadAndSet = async (file: File, setter: (v: string) => void) => {
    const res = await uploadFile(file);
    setter(getFileUrl(res.$id));
  };

  const handleSaveBranding = async () => {
    await axios.patch(
      `${url}/api/settings`,
      {
        branding: {
          themeLogo,
          headerFooterLogo,
          heroImage,
          isHeroImageActive,
          themeSelector,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );

    await refreshSettings();
  };

  const handleSaveShopOptions = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { shopOptions },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );
    await refreshSettings();
  };

  const handleSaveHomeTexts = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { homeTexts },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    await refreshSettings();
  };

  const handleSaveCompanyInfo = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { companyInfo },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    await refreshSettings();
  };

  const handleSaveSocialLinks = async () => {
    const cleanedSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(
        ([, value]) => value && value.trim() !== "",
      ),
    );

    await axios.patch(
      `${url}/api/settings`,
      { socialLinks: cleanedSocialLinks },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    await refreshSettings();
  };

  const handleSaveTheme = async () => {
    await axios.patch(
      `${url}/api/settings`,
      {
        theme,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    await refreshSettings();
  };

  const handleSaveStaticPages = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { staticPages },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    await refreshSettings();
  };

  const handleSaveEmailTemplates = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { emailTemplates },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    await refreshSettings();
  };

  // βάλε μου ένα inline σχολιο εδώ τι γίνετε και που πάει
  const setThemeImage =
    (key: "btnImage1" | "btnImage2" | "btnImage3") => (url: string) => {
      setTheme((p) => ({ ...p, [key]: url }));
    };
  const handleUploadBtnImage1 = (file: File) =>
    uploadAndSet(file, setThemeImage("btnImage1"));
  const handleUploadBtnImage2 = (file: File) =>
    uploadAndSet(file, setThemeImage("btnImage2"));
  const handleUploadBtnImage3 = (file: File) =>
    uploadAndSet(file, setThemeImage("btnImage3"));

  return (
    <>
      <SettingsSection title="Branding">
        <BrandingSection
          themeLogo={themeLogo}
          headerFooterLogo={headerFooterLogo}
          recentFiles={recentFiles}
          ready={ready}
          onThemeLogoChange={setThemeLogo}
          onHeaderFooterLogoChange={setHeaderFooterLogo}
          heroImage={heroImage}
          isHeroImageActive={isHeroImageActive}
          themeSelector={themeSelector}
          onUploadThemeLogo={(file) => uploadAndSet(file, setThemeLogo)}
          onUploadHeaderFooterLogo={(file) =>
            uploadAndSet(file, setHeaderFooterLogo)
          }
          onHeroImageChange={setHeroImage}
          onUploadHeroImage={(file) => uploadAndSet(file, setHeroImage)}
          onToggleHeroImageActive={setIsHeroImageActive}
          onThemeSelectorChange={setThemeSelector}
          onSave={handleSaveBranding}
        />
      </SettingsSection>

      <SettingsSection title="Shop Options">
        <ShopOptionsSection
          shopOptions={shopOptions}
          setShopOptions={setShopOptions}
          onSave={handleSaveShopOptions}
        />
      </SettingsSection>

      <SettingsSection title="Company Info">
        <CompanyInfoSection
          companyInfo={companyInfo}
          recentFiles={recentFiles}
          onChange={setCompanyInfo}
          onSave={handleSaveCompanyInfo}
          ready={ready}
          onUploadIrisQR={(file) =>
            uploadAndSet(file, (url) =>
              setCompanyInfo((p) => ({ ...p, irisBankQR: url })),
            )
          }
        />
      </SettingsSection>

      <SettingsSection title="Social Links">
        <SocialLinksSection
          socialLinks={socialLinks}
          onChange={setSocialLinks}
          onSave={handleSaveSocialLinks}
        />
      </SettingsSection>

      <SettingsSection title="Theme">
        <ThemeSection
          theme={theme}
          setTheme={setTheme}
          primaryDraft={primaryDraft}
          secondaryDraft={secondaryDraft}
          theme3Draft={theme3Draft}
          theme4Draft={theme4Draft}
          theme5Draft={theme5Draft}
          setPrimaryDraft={setPrimaryDraft}
          setSecondaryDraft={setSecondaryDraft}
          setTheme3Draft={setTheme3Draft}
          setTheme4Draft={setTheme4Draft}
          setTheme5Draft={setTheme5Draft}
          ready={ready}
          recentFiles={recentFiles}
          onUploadBtnImage1={handleUploadBtnImage1}
          onUploadBtnImage2={handleUploadBtnImage2}
          onUploadBtnImage3={handleUploadBtnImage3}
          onSave={handleSaveTheme}
        />
      </SettingsSection>

      <SettingsSection title="Home texts">
        <HomeTextsSection
          homeTexts={homeTexts}
          setHomeTexts={setHomeTexts}
          onSave={handleSaveHomeTexts}
        />
      </SettingsSection>

      <SettingsSection title="Email templates">
        <EmailTemplatesSection
          emailTemplates={emailTemplates}
          setEmailTemplates={setEmailTemplates}
          onSave={handleSaveEmailTemplates}
        />
      </SettingsSection>

      <SettingsSection title="Static Pages">
        <StaticPagesSection
          staticPages={staticPages}
          setStaticPages={setStaticPages}
          onSave={handleSaveStaticPages}
        />
      </SettingsSection>
    </>
  );
};

export default AdminCustomizationPanel;
