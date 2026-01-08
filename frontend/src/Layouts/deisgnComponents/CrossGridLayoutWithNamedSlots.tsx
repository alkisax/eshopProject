// frontend\src\Layouts\deisgnComponents\CrossGridLayoutWithNamedSlots.tsx

import { Box, Typography } from "@mui/material";
import { useRef, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import TopCategoryGridHeader from "./TopCategoryGridHeader";
import { useThemeColors } from "../../hooks/useThemeColors";
import { shade, shiftHue, shiftSaturation } from "../../utils/colorUtils";

//  Εδώ υλοποιούμε το concept των "named slots". Αντί για children, το layout δέχεται:
//  - main  → το βασικό / κεντρικό περιεχόμενο
//  - aside → δευτερεύον περιεχόμενο (δεξιά στήλη)
//  το χρησιμοποιήσαμε έτσι:
//   <CrossGridLayoutWithNamedSlots main={children} aside={<HomeButtons />} />
interface Props {
  main: ReactNode; // κεντρικό περιεχόμενο (ό,τι ήταν children)
  aside?: ReactNode; // δεξιά μικρή στήλη (optional)
  title?: string;
}

const CrossGridLayoutWithNamedSlots = ({ main, aside, title }: Props) => {
  // Βασικό χρώμα γραμμών (πράσινο από το γραφιστικό template)
  const { primary } = useThemeColors();

  // χρησιμοποιούσαμε χρώμματα απο τον designer που δεν ήταν ίδια με το primary μας για αυτό φτιάξαμε τρεις συναρτήσεις (gpt) που μετατρέπουν το έαν χρώμα στο αλλο. Δεν είναι ιδανική λύση γιατί σε άλλα χρώμματα μπορεί να μην δουλεύει αλλα θα το αφήσουμε προς το παρόν TODO
  const baseHue = shiftHue(primary, -12);
  const baseSat = shiftSaturation(baseHue, -20);
  const base = shade(baseSat, -20);
  const lineColor = base;

  /**
   * === ΣΤΑΘΕΡΟ ΣΤΥΛ ΚΑΘΕΤΗΣ ΓΡΑΜΜΗΣ ===
   * Κάθε κατακόρυφη γραμμή έχει:
   * - width 3px
   * - backgroundColor lineColor
   * Το flexShrink:0 εξασφαλίζει ότι δεν θα μικραίνει όταν το flex container μικραίνει. Αυτό προστέθηκε για να μπορούμε να κάνουμε τις γραμμές να διασταυρόνοντε πιο έξω απο το περιεχόμενο (που έχει σπρωχθεί προς τα μέσα με padding)
   */
  const verticalLine = {
    width: "3px",
    backgroundColor: lineColor,
    flexShrink: 0,
    pointerEvents: "none",
  };

  /**
   * === ΜΕΤΡΗΣΗ ΥΨΟΥΣ ΠΕΡΙΕΧΟΜΕΝΟΥ ===
   * Θέλουμε οι οριζόντιες γραμμές να ευθυγραμμίζονται με βάση:
   * - το ύψος του περιεχομένου (children)
   * - + λίγα extra pixels για αισθητική (π.χ. 120px)
   * Χρησιμοποιούμε useRef + useLayoutEffect ώστε:
   * - να μετράμε το ακριβές rendered height
   * - πριν ζωγραφιστούν οι γραμμές
   */
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mainHeight, setMainHeight] = useState(0);

  // useLayoutEffect και όχι useEffect
  useLayoutEffect(() => {
    if (contentRef.current) {
      setMainHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, [main]);

  /**
   * === ΥΠΟΛΟΓΙΣΜΟΣ ΥΨΟΥΣ ΤΗΣ ΑΡΙΣΤΕΡΗΣ ΚΟΛΟΝΑΣ ===
   * Το grid layout απαιτεί η αριστερή στήλη να είναι αρκετά ψηλή ώστε:
   * - να χωράει όλο το περιεχόμενο
   * - και να έχει χώρο για την τελευταία οριζόντια γραμμή
   * Εδώ προσθέτουμε 400px "μαξιλάρι".
   */
  const leftColumnHeight = mainHeight + 400;
  /**
   * === ΤΕΛΙΚΗ ΚΑΤΩ ΟΡΙΖΟΝΤΙΑ ΓΡΑΜΜΗ ===
   * Τοποθετείται 4px πριν το τέλος της αριστερής στήλης.
   */
  const bottomLineTop = leftColumnHeight - 4;

  return (
    <>
      {/* Header που κάθεται ΠΑΝΩ από το grid */}
      <TopCategoryGridHeader />

      <Box sx={{ px: "40px", mx: "40px", position: "relative" }}>
        {/*
        === ΕΠΑΝΩ ΟΡΙΖΟΝΤΙΑ ΓΡΑΜΜΗ === 
        Τοποθέτηση ~134px κάτω από το navbar ώστε να ευθυγραμμίζεται με το template
        */}
        <Box
          sx={{
            position: "absolute",
            top: "80px",
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
            pointerEvents: "none",
          }}
        />
        {/*
        === ΜΕΣΑΙΑ ΓΡΑΜΜΗ ===
        Τοποθετείται στο childHeight + 120px ώστε να πέφτει ακριβώς κάτω από το περιεχόμενο
        */}
        <Box
          sx={{
            position: "absolute",
            top: `${mainHeight + 120}px`,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
            pointerEvents: "none",
          }}
        />

        {/*
      === ΚΑΤΩ ΓΡΑΜΜΗ ===
      Τοποθετείται λίγο πριν τελειώσει η αριστερή στήλη
      */}
        <Box
          sx={{
            position: "absolute",
            top: `${bottomLineTop}px`,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
            pointerEvents: "none",
          }}
        />

        {/* GRID */}
        {/* Ο χώρος χωρίζεται ως εξής:
          | line | MAIN (50vw) | line | ASIDE (30vw) | line | filler | */}
        <Box sx={{ display: "flex", width: "100%" }}>
          {/* αριστερή γραμμή */}
          <Box sx={verticalLine} />

          {/* ΚΕΝΤΡΙΚΗ ΣΤΗΛΗ */}
          {/* 
            =========================
            ΚΕΝΤΡΙΚΗ ΣΤΗΛΗ (MAIN SLOT)
            =========================
            Εδώ μπαίνει ΟΛΟ το βασικό περιεχόμενο
            που περνάμε μέσω του prop `main`
            width: 50vw → η αριστερή περιοχή πιάνει το 50% του viewport width
            height: δυναμικό ύψος βάσει περιεχομένου
          */}
          <Box
            sx={{
              width: "50vw",
              minWidth: "200px",
              px: 3,
              height: `${leftColumnHeight}px`,
              boxSizing: "content-box",
            }}
          >
            {/*
              === ΤΙΤΛΟΣ ΣΕΛΙΔΑΣ ===
              Εμφανίζεται μόνο αν υπάρχει title prop
            */}
            {title && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  mb: 4,
                  mt: 2,
                  color: lineColor,
                }}
              >
                {title}
              </Typography>
            )}

            {/* Το ref εδώ είναι κρίσιμο για τη μέτρηση ύψους, Το contentRef μας επιτρέπει να μετράμε το ύψος του */}
            {/* ⚠️⚠️ Αντί να γράφουμε children έχουμε {main} και {aside} οπως ορίστηκαν στα Props παραπάνω */}
            <Box ref={contentRef}>{main}</Box>
          </Box>

          {/* κεντρική γραμμή */}
          <Box sx={verticalLine} />

          {/*
            =========================
            ΔΕΞΙΑ ΣΤΗΛΗ (ASIDE SLOT)
            =========================
            Εδώ μπαίνει δευτερεύον περιεχόμενο
            (π.χ. HomeButtons, promos, filters κλπ) */}
          <Box
            sx={{
              width: "30vw",
              pt: "60px",
              px: 2,
            }}
          >
            {/* ⚠️⚠️ Αντί να γράφουμε children έχουμε {main} και {aside} οπως ορίστηκαν στα Props παραπάνω */}
            {aside}
          </Box>

          {/* δεξιά γραμμή */}
          <Box sx={verticalLine} />

          {/* ΔΕΞΙΑ ΠΕΡΙΟΧΗ (απλά για να γεμίζει το flex) */}
          <Box sx={{ flexGrow: 1 }} />
        </Box>
      </Box>
    </>
  );
};

export default CrossGridLayoutWithNamedSlots;
