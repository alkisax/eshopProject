import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
// import banner2 from "../../assets/banner2.jpg";
import SiteLogo from "../../components/settings_components/SiteLogo";
import { useThemeColors } from "../../hooks/useThemeColors";
import { shade, shiftHue, shiftSaturation } from "../../utils/colorUtils";

// 🔧 NEW: settings context για menu items
import { useSettings } from "../../context/SettingsContext";

// const lineColor = "#008482";

const TopCategoryGridHeader = () => {
  const { primary } = useThemeColors();

  // 🔧 NEW: παίρνουμε menuItems απο settings
  const { settings } = useSettings();
  const menuItems = settings?.theme?.menuItems || [];

  // χρησιμοποιούσαμε χρώμματα απο τον designer που δεν ήταν ίδια με το primary μας για αυτό φτιάξαμε τρεις συναρτήσεις (gpt) που μετατρέπουν το έαν χρώμα στο αλλο. Δεν είναι ιδανική λύση γιατί σε άλλα χρώμματα μπορεί να μην δουλεύει αλλα θα το αφήσουμε προς το παρόν TODO
  const baseHue = shiftHue(primary, -12);
  const baseSat = shiftSaturation(baseHue, -20);
  const base = shade(baseSat, -20);
  const lineColor = base

  return (
    <Box
      sx={{
        px: "40px",
        pt: "40px",
        pb: 0,
        mx: "40px",
        mb: "60px",
        position: "relative",
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
          bottom: "-60px",
          left: "40px",
          width: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Middle vertical — HIDE ON MOBILE */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: "-60px",
          left: "195px",
          width: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Right vertical */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: "-140px",
          left: "340px",
          width: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 1 (above row 1) */}
      <Box
        sx={{
          position: "absolute",
          top: "35px",
          left: "0px",
          width: "400px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 2 (under row 1) */}
      <Box
        sx={{
          position: "absolute",
          top: "57px",
          left: "0px",
          width: "400px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 3 (under row 2) */}
      <Box
        sx={{
          position: "absolute",
          top: "79px",
          left: "0px",
          width: "400px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 4 (bottom) */}
      <Box
        sx={{
          position: "absolute",
          top: "105px",
          left: "0px",
          width: "400px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* =============================
          CATEGORY + LOGO ROW
      ============================== */}

      {/* RIGHT LOGO (desktop only - FIXED POSITION) */}
      <Box
        sx={{
          position: "absolute",
          top: "-20px", // align with horizontal lines
          left: "400px", // 440px grid width + 20px spacing
          display: { xs: "none", sm: "block" },
        }}
      >
        {/* changed for using modular logo on admin dashboard */}
        {/* <Box
          component="img"
          src={banner2}
          alt="Have an Idea logo"
          sx={{ height: "220px", objectFit: "contain" }}
        /> */}
        <SiteLogo height={220} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          alignItems: { xs: "center", sm: "flex-start" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        {/* LOGO on mobile (goes on top) */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            mb: 3,
          }}
        >
          {/* changed for using modular logo on admin dashboard */}
          {/* <Box
            component="img"
            src={banner2}
            alt="Have an Idea logo"
            sx={{
              height: "200px",
              objectFit: "contain",
              mx: "auto",
            }}
          /> */}
          <SiteLogo height={220} />
        </Box>

        {/* Left area with categories */}
        <Box sx={{ pl: 3, pr: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              rowGap: 1,
              columnGap: 3,
              minWidth: "260px",
            }}
          >
            {/* 🔧 REFACTORED: menu items απο settings */}
            {menuItems.slice(0, 6).map((item, i) => (
              <Box
                key={`${item.label}-${i}`}
                sx={{ display: "flex", justifyContent: "center", mb: i >= 4 ? 1 : 0 }}
              >
                <Link to={item.url} style={{ textDecoration: "none" }}>
                  <Typography
                    fontWeight="bold"
                    textAlign="center"
                    sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                  >
                    {item.label}
                  </Typography>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>

        {/* RIGHT LOGO (desktop only) */}
        {/* αφαιρέθηκε για να βγεί εκτός του flexbox και να έχει position absolute αλλα το κρατάω comment out γιατί μπορεί να επιστρέψω  */}
        {/* <Box
          sx={{
            ml: "40px",
            display: { xs: "none", sm: "flex" },
            alignItems: "flex-start",
            justifyContent: "flex-end",
            flexGrow: 1,
            mt: "-60px",
          }}
        >
          <Box
            component="img"
            src={banner2}
            alt="Have an Idea logo"
            sx={{ height: "220px", objectFit: "contain" }}
          />
        </Box> */}

        <Box
          sx={{
            flexGrow: 1,
            maxWidth: "100px",
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>
    </Box>
  );
};

export default TopCategoryGridHeader;
