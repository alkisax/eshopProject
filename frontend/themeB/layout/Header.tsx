// frontend\themeB\Header.tsx
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { AppBar, Toolbar, Box, IconButton, Typography } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import SearchIcon from "@mui/icons-material/Search";

import SidebarMenu from "./SidebarMenu";

import { useSettings } from "../../src/context/SettingsContext";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings } = useSettings();
  const companyName = settings?.companyInfo?.companyName ?? "";

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          color: "#000",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: "1536px", // αντίστοιχο max-w-screen-2xl
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Left: hamburger */}
          <IconButton
            edge="start"
            onClick={() => setIsSidebarOpen(true)}
            sx={{ mr: { lg: 4 } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Center: logo */}
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              fontWeight: 300,
              letterSpacing: "0.08em",
            }}
          >
            {companyName}
          </Typography>

          {/* Right: actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* <IconButton component={RouterLink} to="/search">
              <SearchIcon />
            </IconButton> */}

            <IconButton component={RouterLink} to="/login">
              <AccountCircleIcon />
            </IconButton>

            <IconButton component={RouterLink} to="/cart">
              <ShoppingCartIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <SidebarMenu
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default Header;
