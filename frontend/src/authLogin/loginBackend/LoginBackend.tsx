// alkisax2 Pasword!

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import type { BackendJwtPayload } from '../../types/types'
import { UserAuthContext } from "../../context/UserAuthContext";


interface Props {
  url: string;
}

const LoginBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setUser } = useContext(UserAuthContext);

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
      console.log("backend login token: ", token);
      localStorage.setItem("token", token);

      // decode and update context
      const decoded = jwtDecode<BackendJwtPayload>(token);
      setUser({
        $id: decoded.id,
        email: decoded.email,
        name: decoded.username,
        roles: decoded.roles,
        provider: "backend",
      });

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
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
      <Typography variant="h5" align="center">
        Backend Login
      </Typography>

      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary">
        Login
      </Button>

      <Typography variant="body2" align="center">
        Don’t have an account? <Link to="/register-backend">Register</Link>
      </Typography>
    </Box>
  );
};

export default LoginBackend;
