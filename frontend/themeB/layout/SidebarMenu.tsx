// frontend/themeB/SidebarMenu.tsx
import { useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Divider,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { UserAuthContext } from "../../src/context/UserAuthContext";
import { VariablesContext } from "../../src/context/VariablesContext";
import { CartActionsContext } from "../../src/context/CartActionsContext";
import { handleLogout } from "../../src/authLogin/authFunctions";
import { useSettings } from "../../src/context/SettingsContext";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

const SidebarMenu = ({ isSidebarOpen, setIsSidebarOpen }: Props) => {
  const { user, setUser } = useContext(UserAuthContext);
  const { setHasCart, setHasFavorites } = useContext(VariablesContext);
  const { setCartCount } = useContext(CartActionsContext);
  const { settings } = useSettings();
  const companyName = settings?.companyInfo?.companyName ?? "";

  const navigate = useNavigate();

  const onClose = () => setIsSidebarOpen(false);

  const onLogout = () => {
    handleLogout(setUser, setHasCart, setCartCount, setHasFavorites, navigate);
    setIsSidebarOpen(false);
  };

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  return (
    <Drawer
      anchor="left"
      open={isSidebarOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 260,
          px: 2,
          pt: 1,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Logo */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          component={RouterLink}
          to="/"
          onClick={onClose}
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontSize: "2rem",
            fontWeight: 300,
            letterSpacing: "0.08em",
          }}
        >
          {companyName}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Links */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button component={RouterLink} to="/" onClick={onClose}>
          Home
        </Button>

        <Button component={RouterLink} to="/store" onClick={onClose}>
          Store
        </Button>

        {/* <Button component={RouterLink} to="/search" onClick={onClose}>
          Search
        </Button> */}

        <Button component={RouterLink} to="/cart" onClick={onClose}>
          Cart
        </Button>

        <Divider sx={{ my: 1 }} />

        {user ? (
          <Button color="error" onClick={onLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Button component={RouterLink} to="/login" onClick={onClose}>
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register-backend"
              onClick={onClose}
            >
              Register
            </Button>
          </>
        )}

        {isAdmin && (
          <>
            <Button component={RouterLink} to="/admin-panel" onClick={onClose}>
              Admin Panel
            </Button>

            <Button color="error" onClick={onLogout}>
              Logout
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default SidebarMenu;
