import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext  } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { handleLogout } from '../authLogin/authFunctions'

const NavbarAppwrite = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo / Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/protected"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          Protected
        </Typography>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          Home
        </Typography>

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
            <Button color="inherit" onClick={() => handleLogout(setUser, navigate)}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarAppwrite;
