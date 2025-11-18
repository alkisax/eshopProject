import { Box, Typography } from "@mui/material";
import logoIdea from "../../assets/banner-idea.png";

const lineColor = "#008482";

const TopCategoryGridHeader = () => {
  return (
    <Box
      sx={{
        px: "40px",
        pt: "40px",
        pb: 0,
        mx: "40px",
        position: "relative", // <-- Οι absolute lines anchored εδώ
      }}
    >
      {/* =============================
          VERTICAL LINES (ABSOLUTE)
      ============================== */}

      {/* Left vertical */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: "-60px", // πόσο να κατέβει για να ακουμπήσει CrossGrid
          left: "40px", // μέσα στο padding container!
          width: "3px",
          backgroundColor: lineColor,
        }}
      />

      {/* Middle vertical */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: "-60px",
          left: "195px", // σταθερή θέση όπως στο template
          width: "3px",
          backgroundColor: lineColor,
        }}
      />

      {/* Right vertical */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: "-134px",
          left: "360px",
          width: "3px",
          backgroundColor: lineColor,
        }}
      />

      {/* Horizontal line 1 (above row 1) */}
      <Box
        sx={{
          position: "absolute",
          top: "42px",
          left: "40px",
          width: "320px", // 360 - 40 (right line - left start)
          height: "3px",
          backgroundColor: lineColor,
        }}
      />

      {/* Horizontal line 2 (under row 1) */}
      <Box
        sx={{
          position: "absolute",
          top: "84px",
          left: "40px",
          width: "320px",
          height: "3px",
          backgroundColor: lineColor,
        }}
      />

      {/* =============================
          CATEGORY + LOGO ROW
      ============================== */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {/* Left area with categories */}
        <Box sx={{ pl: 3, pr: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)", // 2 στήλες
              rowGap: 2,
              columnGap: 6,
              minWidth: "260px",
            }}
          >
            {/* row 1 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography fontWeight="bold" textAlign="center">
                ΚΟΛΙΕ
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography fontWeight="bold" textAlign="center">
                ΒΡΑΧΙΟΛΙΑ
              </Typography>
            </Box>

            {/* row 2 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography fontWeight="bold" textAlign="center">
                ΣΚΟΥΛΑΡΙΚΙΑ
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography fontWeight="bold" textAlign="center">
                ΔΑΧΤΥΛΙΔΙΑ
              </Typography>
            </Box>

            {/* row 3 */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Typography fontWeight="bold" textAlign="center">
                ΓΙΑ ΕΜΑΣ
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Typography fontWeight="bold" textAlign="center">
                ΕΠΙΚΟΙΝΩΝΙΑ
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT LOGO */}
        <Box
          sx={{
            ml: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <Box
            component="img"
            src={logoIdea}
            alt="Have an Idea logo"
            sx={{ height: "140px", objectFit: "contain" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TopCategoryGridHeader;
