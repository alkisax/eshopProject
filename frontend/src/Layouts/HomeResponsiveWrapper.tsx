// αυτό το επιπλεων layout φτιάχτικε για να μπορών να χρησιμοποιώ του graphic designer crossgridlayout μόνο σε οθόνες μεγαλήτερες απο μεσαίες

// src/Layouts/HomeResponsiveWrapper.tsx
import { useMediaQuery } from "@mui/material";
// import CrossGridLayout from "./deisgnComponents/CrossGridLayout";
import TopCategoryGridHeader from "./deisgnComponents/TopCategoryGridHeader";
import { useSettings } from "../context/SettingsContext";
import CrossGridLayoutWithNamedSlots from "./deisgnComponents/CrossGridLayoutWithNamedSlots";
import HomeButtons from "../components/homePageComponents/HomeButtons";

const HomeResponsiveWrapper = ({ children }: { children: React.ReactNode }) => {
  const isSmUp = useMediaQuery("(min-width:600px)");
  const { settings } = useSettings();

  const isThemeEnabled =
    !settings?.branding?.themeSelector?.includes("FALSE");
  console.log(' from HomeResponsiveWrapper, isThemeEnabled: ', isThemeEnabled);
  

  // 1️⃣ Theme DISABLED → τίποτα extra
  if (!isThemeEnabled) {
    return <>{children}</>;
  }

  // // 2️⃣ Theme ENABLED + Desktop
  // if (isSmUp) {
  //   return <CrossGridLayout>{children}</CrossGridLayout>;
  // }
  // 2️⃣ Theme ENABLED + Desktop → CROSS GRID + ASIDE
  if (isSmUp) {
    return (
      <CrossGridLayoutWithNamedSlots
        main={children}
        aside={<HomeButtons />}
      />
    );
  }


  // 3️⃣ Theme ENABLED + Mobile
  return (
    <>
      <TopCategoryGridHeader />
      <HomeButtons />
      {children}
    </>
  );
};

export default HomeResponsiveWrapper;
