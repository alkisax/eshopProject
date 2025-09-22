import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Badge } from "@mui/material";
// import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { handleLogout } from "../authLogin/authFunctions";
import { VariablesContext } from "../context/VariablesContext";
import { CartActionsContext } from "../context/CartActionsContext";

const NavbarAppwrite = () => {
  const { setHasCart } = useContext(VariablesContext);
  const { user, setUser } = useContext(UserAuthContext);
  const { cartCount } = useContext(CartActionsContext);
  const navigate = useNavigate();

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fffdf7", // bright warm white
          color: "#4a3f35",           // earthy brown text/icons
          borderBottom: "1px solid #e5e0d8", // λεπτό διακριτικό border
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            id="navbar-home"
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
          >
            <Box
              component="img"
              src="/bulb-transp.svg"
              alt="Έχω μια Ιδέα Logo"
              sx={{ height: 40, mr: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Έχω μια Ιδέα
            </Typography>
          </Box>

          {/* push everything after this to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user && user.roles?.includes("ADMIN") ? (
              <Button color="inherit" component={Link} to="/admin-panel">
                Admin Panel
              </Button>
            ) : (
              user && (
                <Typography variant="body1" sx={{ color: "inherit" }}>
                  Roles: {user.roles?.join(", ")}
                </Typography>
              )
            )}

            {user ? (
              <>
                <Tooltip title="Profile">
                  <IconButton component={Link} to="/profile" sx={{ color: "inherit" }}>
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Logout">
                  <IconButton
                    sx={{ color: "inherit" }}
                    onClick={() => handleLogout(setUser, setHasCart, navigate)}
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

            {cartCount > 0 && (
              <Tooltip title="Cart">
                <IconButton component={Link} to="/cart" sx={{ color: "inherit" }}>
                  <Badge
                    id="navbar-cart-badge"
                    badgeContent={cartCount}
                    color="secondary"
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default NavbarAppwrite;
