import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Tooltip from "@mui/material/Tooltip";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { Link, useNavigate } from "react-router-dom";
import { useContext  } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { handleLogout } from '../authLogin/authFunctions'
import { VariablesContext } from "../context/VariablesContext";

const NavbarAppwrite = () => {
  const { hasCart, setHasCart } = useContext(VariablesContext);
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  // const handleLogin = () => {
  //   navigate("/login");
  // };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {/* Logo / Title */}
          <Tooltip title="Home">
            <IconButton component={Link} color="inherit" to="/">
              <HomeIcon />
            </IconButton>            
          </Tooltip>


          <Typography
            variant="h6"
            component={Link}
            to="/protected"
            sx={{  textDecoration: "none", color: "inherit" }}
          >
            Protected
          </Typography>

          {/* push everything after this to the right */}
          <Box sx={{ flexGrow: 1 }} />


          {/* Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user && user.roles?.includes("ADMIN") ? (
              <Button
                color="inherit"
                component={Link}
                to="/admin-panel"
              >
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
                <Tooltip title="profile">
                  <IconButton component={Link} to="/profile" color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="logout">
                  <IconButton color="inherit" onClick={() => handleLogout(setUser, setHasCart, navigate)}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>

              </>

            ) : (
              <Tooltip title="login">
                <IconButton component={Link} color="inherit" to="/login">
                  <LoginIcon />
                </IconButton>                
              </Tooltip>

            )}

            {hasCart &&
              <IconButton component={Link} color="inherit" to="/cart">
                <ShoppingCartIcon />
              </IconButton>
            }
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>  
  );
};

export default NavbarAppwrite;
