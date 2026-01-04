import { useContext } from "react";
import { ConsentContext } from "../context/ConsentContext";
import { useSettings } from "../context/SettingsContext";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";

const GDPRBanner = () => {
  const { consentGiven, setConsentGiven } = useContext(ConsentContext);
  const { settings } = useSettings();

  if (consentGiven !== null) return null;

  const bgImage = settings?.branding?.heroImage;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
      }}
    >
      {/* 1️⃣ BACKGROUND IMAGE (blurred, fullscreen) */}
      {bgImage && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px)",
            transform: "scale(1.1)", // αποφυγή άκρων blur
          }}
        />
      )}

      {/* 2️⃣ DARK OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* 3️⃣ MODAL (ΚΑΘΑΡΟ, ΧΩΡΙΣ BLUR) */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 420,
            width: "100%",
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h6">
              Cookies & Analytics
            </Typography>

            <Typography data-nosnippet variant="body2">
              Χρησιμοποιούμε Google Analytics για ανάλυση επισκεψιμότητας.
              Μπορείς να αποδεχτείς ή να αρνηθείς.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => setConsentGiven(true)}
              >
                Accept
              </Button>

              <Button
                variant="outlined"
                onClick={() => setConsentGiven(false)}
              >
                Decline
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default GDPRBanner;
