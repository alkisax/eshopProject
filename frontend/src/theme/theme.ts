// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#008482", // dark green (γραμμές, κείμενο, icons)
      light: "#A6DDD8", // mint light background
    },
    secondary: {
      main: "#D7A433", // yellow accent (τιμές, tiles)
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#4a3f35",
    },
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h1: {
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "0.3px",
    },
    h4: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.9rem",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.3px",
    },
  },

  shape: {
    borderRadius: 0, // important
  },

  components: {
    // Buttons → square, clear, sharp design
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "10px 18px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },

    // Links -> consistent
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#008482",
          fontWeight: 500,
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },

    // Cards → straight edges
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
        },
      },
    },

    // List Items
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
        },
      },
    },
  },
});

export default theme;
