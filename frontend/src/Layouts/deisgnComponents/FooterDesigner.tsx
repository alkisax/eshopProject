// frontend\src\Layouts\deisgnComponents\FooterDesigner.tsx
import { Box, Typography, IconButton, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Facebook, Instagram, Email, Phone } from "@mui/icons-material";
import { useSettings } from "../../context/SettingsContext";

const lineColor = "#008482"; // πράσινο του template
const bgColor = "#b7e0db"; // aqua background από designer
const textColor = "#006f6d"; // dark greenish text

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
  const { settings } = useSettings();

  const social = settings?.socialLinks;
  const company = settings?.companyInfo;

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
          // justifyContent: { sm: "space-between" },
          flexWrap: "wrap",
          gap: { xs: 4, sm: 9 },
        }}
      >
        {/* === Each column becomes a centered block in mobile === */}

        {/* Column 1 — Πληροφορίες */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <MuiLink
              id="footer-info-about"
              component={RouterLink}
              to="/about"
              underline="none"
              color="inherit"
            >
              Πληροφορίες
            </MuiLink>
            <br />

            <MuiLink
              id="footer-payment-methods"
              component={RouterLink}
              to="/payment-methods"
              underline="none"
              color="inherit"
            >
              Τρόποι Πληρωμής
            </MuiLink>
            <br />

            <MuiLink
              id="footer-shipping-methods"
              component={RouterLink}
              to="/shipping-methods"
              underline="none"
              color="inherit"
            >
              Τρόποι Αποστολής
            </MuiLink>
            <br />
            <MuiLink
              id="footer-contact"
              component={RouterLink}
              to="/contact"
              underline="none"
              color="inherit"
            >
              Επικοινωνία
            </MuiLink>
          </Box>
        </Box>

        {/* Column 2 — Επικοινωνία */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <VerticalLine />
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <MuiLink
              id="footer-privacy-policy"
              component={RouterLink}
              to="/privacy-policy"
              underline="none"
              color="inherit"
            >
              Πολιτική Απορρήτου
            </MuiLink>
            <br />
            <MuiLink
              id="footer-return-policy"
              component={RouterLink}
              to="/return-policy"
              underline="none"
              color="inherit"
            >
              Πολιτική Επιστροφών
            </MuiLink>
            <br />

            <MuiLink
              id="footer-cookie-policy"
              component={RouterLink}
              to="/cookie-policy"
              underline="none"
              color="inherit"
            >
              Πολιτική Cookies
            </MuiLink>
          </Box>
        </Box>
      </Box>

      {/* === SOCIAL SECTION === */}
      <Box sx={{ mt: 4, textAlign: { xs: "center", sm: "left" } }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Ακολουθήστε μας
        </Typography>

        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.4)",
            display: "inline-flex",
            borderRadius: 1,
            px: 2,
            py: 1,
            gap: 1,
          }}
        >
          {social?.facebook && (
            <IconButton
              id="footer-social-facebook"
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              <Facebook />
            </IconButton>
          )}

          {social?.instagram && (
            <IconButton
              id="footer-social-instagram"
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              <Instagram />
            </IconButton>
          )}

          {company?.email && (
            <IconButton
              id="footer-social-email"
              href={`mailto:${company.email}`}
              color="inherit"
            >
              <Email />
            </IconButton>
          )}

          {company?.phone && (
            <IconButton
              id="footer-social-phone"
              href={`tel:${company.phone}`}
              color="inherit"
            >
              <Phone />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FooterDesigner;
