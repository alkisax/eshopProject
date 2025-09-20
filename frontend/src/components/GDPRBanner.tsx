import { useContext } from "react";
import { ConsentContext } from "../context/ConsentContext";
import { Box, Button, Typography, Paper } from "@mui/material";

const GDPRBanner = () => {
  const { consentGiven, setConsentGiven } = useContext(ConsentContext);

  if (consentGiven !== null) return null; // already decided

  return (
    <Paper
      elevation={4}
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        zIndex: 2000,
      }}
    >
      <Typography>
        We use Google Analytics to analyze traffic. Please accept or decline.
      </Typography>
      <Box>
        <Button
          variant="contained"
          onClick={() => setConsentGiven(true)}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 1 }}
          onClick={() => setConsentGiven(false)}
        >
          Decline
        </Button>
      </Box>
    </Paper>
  );
};

export default GDPRBanner;