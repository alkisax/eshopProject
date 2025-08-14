import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext  } from "react";
import { UserAuthContext } from "../../../context/UserAuthContext";
import { account } from "../appwriteConfig";

const NavbarAppwrite = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/appwrite-login");
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      try {
        await account.deleteSession("current");
      } catch (error: unknown) {
        console.log("no appwrite sessinon", error);
      }
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error during universal logout:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo / Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/appwrite-home"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          APWHome
        </Typography>

        {/* Buttons */}
        <Box>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              AW-Login
            </Button>
          )}      
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarAppwrite;
