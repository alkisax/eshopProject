// αυτό το επιπλεων layout φτιάχτικε για να μπορών να χρησιμοποιώ του graphic designer crossgridlayout μόνο σε οθόνες μεγαλήτερες απο μεσαίες

// src/Layouts/HomeResponsiveWrapper.tsx
import { useMediaQuery } from "@mui/material";
import CrossGridLayout from "./deisgnComponents/CrossGridLayout";
import TopCategoryGridHeader from "./deisgnComponents/TopCategoryGridHeader";

const HomeResponsiveWrapper = ({ children }: { children: React.ReactNode }) => {
  const isSmUp = useMediaQuery("(min-width:600px)");

  if (isSmUp) {
    return <CrossGridLayout>{children}</CrossGridLayout>;
  }

  return (
    <>
      <TopCategoryGridHeader />
      {children}
    </>
  ); // μικρή οθόνη → χωρίς CrossGrid
};

export default HomeResponsiveWrapper;
