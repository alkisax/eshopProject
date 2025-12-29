import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
// import banner2 from "../../assets/banner2.jpg";
import SiteLogo from "../../components/settings_components/SiteLogo";

const lineColor = "#008482";

const TopCategoryGridHeader = () => {
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
          {/* <SiteLogo height={220} /> */}
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
            {/* row 1 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link to="/store?cat=Κολιέ" style={{ textDecoration: "none" }}>
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                >
                  ΚΟΛΙΕ
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link to="/store?cat=Βραχιόλι" style={{ textDecoration: "none" }}>
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{
                    color: lineColor,
                    fontSize: "0.9rem",
                    lineHeight: 1.1,
                  }}
                >
                  ΒΡΑΧΙΟΛΙΑ
                </Typography>
              </Link>
            </Box>

            {/* row 2 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link
                to="/store?cat=Σκουλαρίκια"
                style={{ textDecoration: "none" }}
              >
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                >
                  ΣΚΟΥΛΑΡΙΚΙΑ
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link
                to="/store?cat=Δαχτυλίδι"
                style={{ textDecoration: "none" }}
              >
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                >
                  ΔΑΧΤΥΛΙΔΙΑ
                </Typography>
              </Link>
            </Box>

            {/* row 3 */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Link to="/about" style={{ textDecoration: "none" }}>
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                >
                  ΓΙΑ ΕΜΑΣ
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Link to="/contact" style={{ textDecoration: "none" }}>
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor, fontSize: "0.9rem", lineHeight: 1.1 }}
                >
                  ΕΠΙΚΟΙΝΩΝΙΑ
                </Typography>
              </Link>
            </Box>
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
