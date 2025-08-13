import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext  } from "react";
import { UserAuthContext } from "../UserAuthContext";
import { account } from "../appwriteConfig";

const GithubNavbarTest = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/github-login");
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      navigate("/github-login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo / Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/git-home"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          GitHome
        </Typography>

        {/* Buttons */}
        <Box>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Git-Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Git-Login
            </Button>
          )}      
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GithubNavbarTest;
