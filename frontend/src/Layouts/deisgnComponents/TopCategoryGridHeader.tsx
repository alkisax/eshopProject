import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import banner2 from "../../assets/banner2.jpg";

const lineColor = "#008482";

const TopCategoryGridHeader = () => {
  return (
    <Box
      sx={{
        px: "40px",
        pt: "40px",
        pb: 0,
        mx: "40px",
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
          bottom: "-134px",
          left: "360px",
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
          width: "440px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 2 (under row 1) */}
      <Box
        sx={{
          position: "absolute",
          top: "70px",
          left: "0px",
          width: "440px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 3 (under row 2) */}
      <Box
        sx={{
          position: "absolute",
          top: "110px",
          left: "0px",
          width: "440px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* Horizontal line 4 (bottom) */}
      <Box
        sx={{
          position: "absolute",
          top: "150px",
          left: "0px",
          width: "440px",
          height: "3px",
          backgroundColor: lineColor,
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* =============================
          CATEGORY + LOGO ROW
      ============================== */}
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
          <Box
            component="img"
            src={banner2}
            alt="Have an Idea logo"
            sx={{
              height: "200px",
              objectFit: "contain",
              mx: "auto",
            }}
          />
        </Box>

        {/* Left area with categories */}
        <Box sx={{ pl: 3, pr: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              rowGap: 2,
              columnGap: 6,
              minWidth: "260px",
            }}
          >
            {/* row 1 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link to="/store?cat=Κολιέ" style={{ textDecoration: "none" }}>
                <Typography
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: lineColor }}
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
                  sx={{ color: lineColor }}
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
                  sx={{ color: lineColor }}
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
                  sx={{ color: lineColor }}
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
                  sx={{ color: lineColor }}
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
                  sx={{ color: lineColor }}
                >
                  ΕΠΙΚΟΙΝΩΝΙΑ
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* RIGHT LOGO (desktop only) */}
        <Box
          sx={{
            ml: 4,
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <Box
            component="img"
            src={banner2}
            alt="Have an Idea logo"
            sx={{ height: "320px", objectFit: "contain" }}
          />
        </Box>

        <Box sx={{ flexGrow: 1, maxWidth: "100px", display: { xs: "none", sm: "block" } }} />
      </Box>
    </Box>
  );
};

export default TopCategoryGridHeader;
