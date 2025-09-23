import { Box, Container, IconButton, Link as MuiLink, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Facebook, Instagram, Email, Phone } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 4,
        backgroundColor: "#f2efe9", // ελαφρύ earthy beige
        color: "#4a3f35", // σκούρο earthy καφέ
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2}>

          {/* Logo column */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src="/bulb-transp.svg"
                alt="Έχω μια Ιδέα Logo"
                sx={{ height: 100, mr: 2 }} // 👈 πιο μεγάλο
              />
            </Box>
          </Grid>

          {/* Πληροφορίες */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Πληροφορίες
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink component={RouterLink} to="/payment-methods" underline="hover" color="inherit" variant="body2">
                Τρόποι Πληρωμής
              </MuiLink>
              <MuiLink component={RouterLink} to="/shipping-methods" underline="hover" color="inherit" variant="body2">
                Τρόποι Αποστολής
              </MuiLink>
              <MuiLink href="#" underline="hover" color="inherit" variant="body2">
                Συχνές Ερωτήσεις
              </MuiLink>
              <MuiLink component={RouterLink} to="/terms" underline="hover" color="inherit" variant="body2">
                Όροι Χρήσης
              </MuiLink>
            </Box>
          </Grid>

          {/* Εταιρεία */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Εταιρεία
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink component={RouterLink} to="/contact" underline="hover" color="inherit" variant="body2">
                Επικοινωνία
              </MuiLink>
            </Box>
          </Grid>

          {/* Πολιτικές */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Πολιτικές
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink component={RouterLink} to="/privacy-policy" underline="hover" color="inherit" variant="body2">
                Πολιτική Απορρήτου
              </MuiLink>
              <MuiLink component={RouterLink} to="/return-policy" underline="hover" color="inherit" variant="body2">
                Πολιτική Επιστροφών
              </MuiLink>
              <MuiLink component={RouterLink} to="/cookie-policy" underline="hover" color="inherit" variant="body2">
                Πολιτική Cookies
              </MuiLink>
            </Box>
          </Grid>

          {/* Social */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Ακολουθήστε μας
            </Typography>
            <Box>
              <IconButton href="#" color="inherit"><Facebook /></IconButton>
              <IconButton href="#" color="inherit"><Instagram /></IconButton>
              <IconButton href="mailto:info@example.com" color="inherit"><Email /></IconButton>
              <IconButton href="tel:+302100000000" color="inherit"><Phone /></IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4, borderTop: "1px solid #d6d2c4", pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Έχω μια Ιδέα... | Χειροποίητο Κόσμημα.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
