// src/layouts/CrossGridLayout.tsx
import { Box, Typography } from "@mui/material";
import { useRef, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import TopCategoryGridHeader from "./TopCategoryGridHeader";

interface Props {
  children: ReactNode;
  title?: string; // Προεραιτικός τίτλος που εμφανίζεται πάνω από το περιεχόμενο
}

const CrossGridLayout = ({ children, title }: Props) => {
  // Βασικό χρώμα γραμμών (πράσινο από το γραφιστικό template)
  const lineColor = "#008482";

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
  const [childHeight, setChildHeight] = useState(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      // Πραγματικό ύψος του κειμένου/περιεχομένου
      setChildHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, [children]);

  /**
   * === ΥΠΟΛΟΓΙΣΜΟΣ ΥΨΟΥΣ ΤΗΣ ΑΡΙΣΤΕΡΗΣ ΚΟΛΟΝΑΣ ===
   * Το grid layout απαιτεί η αριστερή στήλη να είναι αρκετά ψηλή ώστε:
   * - να χωράει όλο το περιεχόμενο
   * - και να έχει χώρο για την τελευταία οριζόντια γραμμή
   * Εδώ προσθέτουμε 400px "μαξιλάρι".
   */
  const leftColumnHeight = childHeight + 400;

  /**
   * === ΤΕΛΙΚΗ ΚΑΤΩ ΟΡΙΖΟΝΤΙΑ ΓΡΑΜΜΗ ===
   * Τοποθετείται 4px πριν το τέλος της αριστερής στήλης.
   */
  const bottomLineTop = leftColumnHeight - 4;

  return (
    <>
      <TopCategoryGridHeader />

      {/* === ΕΞΩΤΕΡΙΚΟ WRAPPER ===  px: οριζόντιο padding * mx: εξωτερικό
      margin ώστε οι γραμμές να μην ακουμπάνε τα άκρα του viewport *
      position:relative ώστε όλα τα absolute στοιχεία (γραμμές) να τοποθετούνται μέσα σε αυτό. */}
      <Box sx={{ px: "40px", py: "0px", mx: "40px", position: "relative" }}>
        {/*
      === ΕΠΑΝΩ ΟΡΙΖΟΝΤΙΑ ΓΡΑΜΜΗ === 
      Τοποθέτηση ~134px κάτω από το navbar ώστε να ευθυγραμμίζεται με το template
      */}
        <Box
          sx={{
            position: "absolute",
            top: "134px",
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
            zIndex: 10, // ώστε να μην περνάει κάτω από το περιεχόμενο
          }}
        />

        {/*
      === ΜΕΣΑΙΑ ΓΡΑΜΜΗ ===
      Τοποθετείται στο childHeight + 120px ώστε να πέφτει ακριβώς κάτω από το περιεχόμενο
      */}
        <Box
          sx={{
            position: "absolute",
            top: `${childHeight + 120}px`,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: lineColor,
            zIndex: 10,
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
            zIndex: 10,
          }}
        />

        {/*
      ======================================================
        == ΚΥΡΙΩΣ ΠΕΡΙΟΧΗ — GRID ROW ΜΕ ΚΑΘΕΤΕΣ ΓΡΑΜΜΕΣ ==
      ======================================================
         */}
        <Box sx={{ display: "flex", width: "100%" }}>
          {/* 1η ΚΑΘΕΤΗ ΓΡΑΜΜΗ (ΑΡΙΣΤΕΡΗ) */}
          <Box sx={verticalLine} />

          {/* 
        === ΑΡΙΣΤΕΡΗ ΚΟΛΟΝΑ ΠΕΡΙΕΧΟΜΕΝΟΥ ===
        width: 50vw → η αριστερή περιοχή πιάνει το 50% του viewport width
        height: δυναμικό ύψος βάσει περιεχομένου
        */}
          <Box
            sx={{
              width: "50vw",
              minWidth: "200px",
              px: 3,
              pt: "60px",
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
                  // justifyContent: "left",
                  fontWeight: "bold",
                  textAlign: "left",
                  mb: 4,
                  mt: 2,
                  color: lineColor
                }}
              >
                {title}
              </Typography>
            )}

            {/* === ΠΡΑΓΜΑΤΙΚΟ ΠΕΡΙΕΧΟΜΕΝΟ ===
          Το contentRef μας επιτρέπει να μετράμε το ύψος του */}
            <Box ref={contentRef}>{children}</Box>
          </Box>

          {/* 2η ΚΑΘΕΤΗ ΓΡΑΜΜΗ (ΚΕΝΤΡΟ) */}
          <Box sx={verticalLine} />

          {/* ΚΕΝΗ ΜΕΣΑΙΑ ΠΕΡΙΟΧΗ ΤΟΥ GRID */}
          <Box sx={{ width: "30vw", pt: "60px" }} />

          {/* 3η ΚΑΘΕΤΗ ΓΡΑΜΜΗ (ΔΕΞΙΑ) */}
          <Box
            sx={{
              ...verticalLine,
              display: { xs: "none", sm: "block" }, // HIDE ON MOBILE
            }}
          />
          {/* ΔΕΞΙΑ ΠΕΡΙΟΧΗ (απλά για να γεμίζει το flex) */}
          <Box sx={{ flexGrow: 1, pt: "60px" }} />
        </Box>
      </Box>
    </>
  );
};

export default CrossGridLayout;
