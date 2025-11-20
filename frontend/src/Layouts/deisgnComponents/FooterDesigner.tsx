import { Box, Typography, IconButton, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Facebook, Instagram, Email, Phone } from "@mui/icons-material";

const lineColor = "#008482";   // πράσινο του template
const bgColor = "#b7e0db";     // aqua background από designer
const textColor = "#006f6d";   // dark greenish text

// Vertical line — hides automatically in mobile
const VerticalLine = () => (
  <Box
    sx={{
      width: "3px",
      backgroundColor: lineColor,
      height: "60px",
      mr: 2,
      display: { xs: "none", sm: "block" }, // ❗ hide on mobile
    }}
  />
);

const FooterDesigner = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: bgColor,
        color: textColor,
        mt: 6,
        py: 4,
        px: { xs: 3, sm: 6 },
      }}
    >
      {/*  ==== TOP GRID ===== */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // ❗ mobile = one column
          justifyContent: { sm: "space-between" },
          flexWrap: "wrap",
          gap: { xs: 4, sm: 2 },
        }}
      >
        {/* === Each column becomes a centered block in mobile === */}
        
        {/* Column 1 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Πληροφορίες
            </Typography>

            <MuiLink component={RouterLink} to="/payment-methods" underline="none" color="inherit">
              Τρόποι Πληρωμής
            </MuiLink>
            <br />
            <MuiLink component={RouterLink} to="/shipping-methods" underline="none" color="inherit">
              Τρόποι Αποστολής
            </MuiLink>
          </Box>
        </Box>

        {/* Column 2 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Συχνές Ερωτήσεις
            </Typography>

            <MuiLink component={RouterLink} to="/terms" underline="none" color="inherit">
              Όροι Χρήσης
            </MuiLink>
            <br />

            <MuiLink component={RouterLink} to="/about" underline="none" color="inherit">
              Εταιρεία
            </MuiLink>
          </Box>
        </Box>

        {/* Column 3 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Επικοινωνία
            </Typography>

            <MuiLink component={RouterLink} to="/privacy-policy" underline="none" color="inherit">
              Πολιτικές
            </MuiLink>
            <br />

            <MuiLink component={RouterLink} to="/privacy-policy" underline="none" color="inherit">
              Πολιτική Απορρήτου
            </MuiLink>
          </Box>
        </Box>

        {/* Column 4 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Πολιτική Επιστροφών
            </Typography>

            <MuiLink component={RouterLink} to="/return-policy" underline="none" color="inherit">
              Πολιτική Επιστροφών
            </MuiLink>
            <br />

            <MuiLink component={RouterLink} to="/cookie-policy" underline="none" color="inherit">
              Πολιτική Cookies
            </MuiLink>
          </Box>
        </Box>
      </Box>

      {/* === SOCIAL SECTION === */}
      <Box sx={{ mt: 4, textAlign: { xs: "center", sm: "left" } }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Ακολουθήστε μας
        </Typography>

        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.4)",
            display: "inline-flex",
            borderRadius: 1,
            px: 2,
            py: 1,
          }}
        >
          <IconButton href="#" color="inherit"><Facebook /></IconButton>
          <IconButton href="#" color="inherit"><Instagram /></IconButton>
          <IconButton href="mailto:info@example.com" color="inherit"><Email /></IconButton>
          <IconButton href="tel:+302100000000" color="inherit"><Phone /></IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default FooterDesigner;
