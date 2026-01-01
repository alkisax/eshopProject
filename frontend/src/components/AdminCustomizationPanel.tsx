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
import ThemeColorsSection from "./settings_components/admin_settings_components/ThemeColorsSection";
import HomeTextsSection from "./settings_components/admin_settings_components/HomeTextsSection";
import StaticPagesSection from "./settings_components/admin_settings_components/StaticPagesSection";

const AdminCustomizationPanel = () => {
  const { url } = useContext(VariablesContext);
  const { settings, refreshSettings } = useSettings();
  const { ready, uploadFile, listFiles, getFileUrl } = useAppwriteUploader();

  const [themeLogo, setThemeLogo] = useState(
    settings?.branding?.themeLogo || ""
  );
  const [headerFooterLogo, setHeaderFooterLogo] = useState(
    settings?.branding?.headerFooterLogo || ""
  );
  const [heroImage, setHeroImage] = useState(
    settings?.branding?.heroImage || ""
  );
  const [isHeroImageActive, setIsHeroImageActive] = useState(
    settings?.branding?.isHeroImageActive || false
  );
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
  });
  const [socialLinks, setSocialLinks] = useState({
    facebook: settings?.socialLinks?.facebook || "",
    instagram: settings?.socialLinks?.instagram || "",
    etsy: settings?.socialLinks?.etsy || "",
    tiktok: settings?.socialLinks?.tiktok || "",
  });
  const [themeColors, setThemeColors] = useState({
    primaryColor: settings?.theme?.primaryColor || "#48C4Cf",
    secondaryColor: settings?.theme?.secondaryColor || "#FFD500",
  });
  const [primaryDraft, setPrimaryDraft] = useState(themeColors.primaryColor);
  const [secondaryDraft, setSecondaryDraft] = useState(
    themeColors.secondaryColor
  );
  const [staticPages, setStaticPages] = useState({
    aboutUs: "",
    returnPolicy: "",
    paymentMethods: "",
    shippingMethods: "",
    privacyPolicy: "",
    termsOfUse: "",
  });

  // sync όταν αλλάξουν τα settings
  useEffect(() => {
    if (!settings) return;
    setThemeLogo(settings.branding?.themeLogo || "");
    setHeaderFooterLogo(settings.branding?.headerFooterLogo || "");
    setHeroImage(settings.branding?.heroImage || "");
    setIsHeroImageActive(settings.branding?.isHeroImageActive || false);
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
    });
    setSocialLinks({
      facebook: settings.socialLinks?.facebook || "",
      instagram: settings.socialLinks?.instagram || "",
      etsy: settings.socialLinks?.etsy || "",
      tiktok: settings.socialLinks?.tiktok || "",
    });
    setThemeColors({
      primaryColor: settings.theme?.primaryColor || "#48C4Cf",
      secondaryColor: settings.theme?.secondaryColor || "#FFD500",
    });
    setPrimaryDraft(settings?.theme?.primaryColor || "#48C4Cf");
    setSecondaryDraft(settings?.theme?.secondaryColor || "#FFD500");
    setStaticPages({
      aboutUs: settings.staticPages?.aboutUs || "",
      returnPolicy: settings.staticPages?.returnPolicy || "",
      paymentMethods: settings.staticPages?.paymentMethods || "",
      shippingMethods: settings.staticPages?.shippingMethods || "",
      privacyPolicy: settings.staticPages?.privacyPolicy || "",
      termsOfUse: settings.staticPages?.termsOfUse || "",
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
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
      }
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
      }
    );
    await refreshSettings();
  };

  const handleSaveSocialLinks = async () => {
    const cleanedSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(
        ([, value]) => value && value.trim() !== ""
      )
    );

    await axios.patch(
      `${url}/api/settings`,
      { socialLinks: cleanedSocialLinks },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    await refreshSettings();
  };

  const handleSaveThemeColors = async () => {
    await axios.patch(
      `${url}/api/settings`,
      { theme: themeColors },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
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
      }
    );
    await refreshSettings();
  };

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
          onUploadThemeLogo={(file) => uploadAndSet(file, setThemeLogo)}
          onUploadHeaderFooterLogo={(file) =>
            uploadAndSet(file, setHeaderFooterLogo)
          }
          onHeroImageChange={setHeroImage}
          onUploadHeroImage={(file) => uploadAndSet(file, setHeroImage)}
          onToggleHeroImageActive={setIsHeroImageActive}
          onSave={handleSaveBranding}
        />
      </SettingsSection>

      <SettingsSection title="Company Info">
        <CompanyInfoSection
          companyInfo={companyInfo}
          onChange={setCompanyInfo}
          onSave={handleSaveCompanyInfo}
        />
      </SettingsSection>

      <SettingsSection title="Social Links">
        <SocialLinksSection
          socialLinks={socialLinks}
          onChange={setSocialLinks}
          onSave={handleSaveSocialLinks}
        />
      </SettingsSection>

      <SettingsSection title="Theme Colors">
        <ThemeColorsSection
          themeColors={themeColors}
          primaryDraft={primaryDraft}
          secondaryDraft={secondaryDraft}
          setThemeColors={setThemeColors}
          setPrimaryDraft={setPrimaryDraft}
          setSecondaryDraft={setSecondaryDraft}
          onSave={handleSaveThemeColors}
        />
      </SettingsSection>

      <SettingsSection title="Home texts">
        <HomeTextsSection
          homeTexts={homeTexts}
          setHomeTexts={setHomeTexts}
          onSave={handleSaveHomeTexts}
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
