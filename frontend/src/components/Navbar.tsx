// frontend\src\components\Navbar.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BadgeIcon from "@mui/icons-material/Badge";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { handleLogout } from "../authLogin/authFunctions";
import { VariablesContext } from "../context/VariablesContext";
import { CartActionsContext } from "../context/CartActionsContext";
// import bannerIdea from '../assets/banner-idea.png'
import SettingsLogo from "./settings_components/SettingsLogo";
import { useSettings } from "../context/SettingsContext";

const NavbarAppwrite = () => {
  const { setHasCart, hasFavorites, setHasFavorites } =
    useContext(VariablesContext);
  const { user, setUser } = useContext(UserAuthContext);
  const { cartCount, setCartCount } = useContext(CartActionsContext);
  const navigate = useNavigate();
  const { settings, loading } = useSettings();

  const companyName = !loading && settings?.companyInfo?.companyName;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fffdf7", // bright warm white
          color: "#4a3f35", // earthy brown text/icons
          borderBottom: "1px solid #e5e0d8", // λεπτό διακριτικό border
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            id="navbar-home"
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <SettingsLogo height={40} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {companyName}
            </Typography>
          </Box>

          {/* push everything after this to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Store Button */}
            <Tooltip title="Store" arrow>
              <IconButton
                id="navbar-store-btn"
                component={NavLink}
                to="/store"
                sx={{
                  color: "inherit",
                  borderRadius: "50%",
                  "&.active": { backgroundColor: "#48C4Cf", color: "#fff" },
                }}
              >
                <StorefrontIcon />
              </IconButton>
            </Tooltip>

            {/* Cart first (after Store) */}
            {cartCount > 0 && (
              <Tooltip title="Cart">
                <IconButton
                  id="navbar-cart-btn"
                  component={NavLink}
                  to="/cart"
                  sx={{
                    color: "inherit",
                    borderRadius: "50%",
                    "&.active": { backgroundColor: "#48C4Cf", color: "#fff" },
                  }}
                >
                  <Badge
                    id="navbar-cart-badge"
                    badgeContent={cartCount}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#FFD500",
                        color: "#4a3f35",
                      },
                    }}
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Favorites next */}
            {hasFavorites && (
              <Tooltip title="Favorites">
                <IconButton
                  id="navbar-favorites-icon"
                  component={NavLink}
                  to="/favorites"
                  sx={{
                    color: "inherit",
                    borderRadius: "50%",
                    "&.active": { backgroundColor: "#48C4Cf", color: "#fff" },
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* 🟦 Collapse zone - admin/profile/logout */}
            {/* On large screens: show normally; on small, collapse to hamburger */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
              {user && user.roles?.includes("ADMIN") ? (
                <Tooltip title="Admin Panel" arrow>
                  <IconButton
                    id="navbar-admin-btn"
                    component={NavLink}
                    to="/admin-panel"
                    sx={{
                      color: "inherit",
                      borderRadius: "50%",
                      "&.active": { backgroundColor: "#48C4Cf", color: "#fff" },
                    }}
                  >
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                user && (
                  <Tooltip title={`Roles: ${user.roles?.join(", ")}`} arrow>
                    <IconButton sx={{ color: "inherit" }}>
                      <BadgeIcon />
                    </IconButton>
                  </Tooltip>
                )
              )}

              {user ? (
                <>
                  <Tooltip title="Profile">
                    <IconButton
                      id="navbar-profile-btn"
                      component={NavLink}
                      to="/profile"
                      sx={{
                        color: "inherit",
                        borderRadius: "50%",
                        "&.active": {
                          backgroundColor: "#48C4Cf",
                          color: "#fff",
                        },
                      }}
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Logout">
                    <IconButton
                      id="navbar-logout"
                      sx={{ color: "inherit" }}
                      onClick={() =>
                        handleLogout(
                          setUser,
                          setHasCart,
                          setCartCount,
                          setHasFavorites,
                          navigate
                        )
                      }
                    >
                      <LogoutIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Login">
                  <IconButton
                    id="navbar-login"
                    component={Link}
                    to="/login"
                    sx={{ color: "inherit" }}
                  >
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* 🍔 Hamburger on small screens */}
            <Box sx={{ display: { xs: "flex", sm: "none" } }}>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {user && user.roles?.includes("ADMIN") && (
                  <MenuItem
                    component={NavLink}
                    to="/admin-panel"
                    onClick={handleMenuClose}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin Panel
                  </MenuItem>
                )}
                {user && (
                  <MenuItem
                    component={NavLink}
                    to="/profile"
                    onClick={handleMenuClose}
                  >
                    <AccountCircleIcon sx={{ mr: 1 }} /> Profile
                  </MenuItem>
                )}
                {user ? (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleLogout(
                        setUser,
                        setHasCart,
                        setCartCount,
                        setHasFavorites,
                        navigate
                      );
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                ) : (
                  <MenuItem
                    component={Link}
                    to="/login"
                    onClick={handleMenuClose}
                  >
                    <LoginIcon sx={{ mr: 1 }} /> Login
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default NavbarAppwrite;
