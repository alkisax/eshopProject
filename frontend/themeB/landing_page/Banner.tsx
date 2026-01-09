// frontend\themeB\Banner.tsx
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useSettings } from "../../src/context/SettingsContext";
import { removeGreekAccents } from "../../src/utils/removeGreekAccents";

/**
 * Hero / Banner section για landing page
 * UI-only component (χωρίς data, χωρίς context)
 */
const Banner = () => {
  const { settings } = useSettings();
  const companyName = settings?.companyInfo?.companyName ?? "";
  const secondaryColor = settings?.theme?.secondaryColor;
  const heroImage = settings?.branding?.heroImage;
  // const themeLogo = settings?.branding?.themeLogo;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: 550, md: 700 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        pb: 6,
        gap: 2,
        backgroundImage: heroImage
          ? `linear-gradient(180deg, #00000055, #000000aa), url(${heroImage})`
          : "linear-gradient(180deg, #00000088, #000000cc)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: "#fff",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontSize: { xs: "2.2rem", sm: "3rem", md: "3.6rem" },
          lineHeight: 1.1,
        }}
      >
        {removeGreekAccents(companyName || "Έχω μια Ιδέα")}
      </Typography>

      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#fff",
          fontWeight: 300,
          letterSpacing: "0.05em",
          fontSize: { xs: "1.1rem", sm: "1.4rem" },
        }}
      >
        χειροποίητα κοσμήματα
      </Typography>

      {/* Actions */}
      <Stack
        direction="column"
        alignItems="center"
        sx={{
          width: "100%",
          mt: 3,
        }}
      >
        <Button
          component={RouterLink}
          to="/store"
          variant="contained"
          sx={{
            height: 48,
            width: 240,
            fontSize: "1rem",
            letterSpacing: "0.05em",
            backgroundColor: secondaryColor,
            color: "#000",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Shop Now
        </Button>
      </Stack>
    </Box>
  );
};

export default Banner;
