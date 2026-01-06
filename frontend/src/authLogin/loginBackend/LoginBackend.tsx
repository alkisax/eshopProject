// frontend\src\authLogin\loginBackend\LoginBackend.tsx
// alkisax2 Pasword!
// alkisax AdminPass1!

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Box, Button, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import type { BackendJwtPayload } from '../../types/types'
import { UserAuthContext } from "../../context/UserAuthContext";

interface Props {
  url: string;
}

const LoginBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { setUser, setIsLoading } = useContext(UserAuthContext);

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmitBackend = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${url}/api/auth`, {
        username,
        password,
      });

      console.log("Login successful:", response.data);

      // store token
      const token = response.data.data.token;
      // console.log("backend login token: ", token);
      localStorage.setItem("token", token);

      // decode and update context
      const decoded = jwtDecode<BackendJwtPayload>(token);
      setUser({
        _id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles,
        hasPassword: decoded.hasPassword,
        provider: "backend",
      });

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmitBackend}
      sx={{
        maxWidth: 400,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 5,
      }}
    >
      <TextField
        id="backend-login-username"
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        autoComplete="email"
      />

      <TextField
        id="backend-login-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        id="backend-form-submit-btn"
        type="submit" variant="contained" color="primary">
        Login
      </Button>

      <Typography variant="body2" align="center">
        Don’t have an account? <Link id="backend-form-register-link" to="/register-backend">Register</Link>
      </Typography>
      <Typography variant="caption" align="center">
        Powered by MongoDB
      </Typography>
    </Box>
  );
};

export default LoginBackend;
