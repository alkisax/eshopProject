//https://dev.to/devyoma/authentication-in-react-with-appwrite-4jaj

import { useState, useContext, useEffect  } from "react";
import { Link, useNavigate  } from "react-router-dom";
import axios from "axios";
import { Box, Button, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { account } from "../../lib/appwriteConfig";
import { UserAuthContext } from "../../context/UserAuthContext";

interface params {
  url: string
}

const LoginAppwriteLogin = ({ url }: params) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const navigate = useNavigate()
  const { setUser, user, setIsLoading } = useContext(UserAuthContext);

  useEffect(() => {
    if(user !== null){
       navigate("/");
    }
  }, [user, navigate])
  
  const handleLogin = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();    
    // setButtonLoading(true)

    if (password === "" || email === "") {
      alert("Please fill in the field required")
      // setButtonLoading(false)
      return
    }

    // appwrite Login functionality 👇

    try {
      // Delete current Appwrite session if any
      await account.deleteSession("current").catch(() => {});

      // ✅ Appwrite login
      const response = await account.createEmailPasswordSession(email, password);
      console.log("Appwrite login response:", response);

      // ✅ Sync with backend MongoDB
      const syncRes = await axios.post(`${url}/api/auth/appwrite/sync`, {
        name: "", // optional, Appwrite session does not provide name here
        email: email,
      });

      if (syncRes.data.status) {
        const { user: dbUser, token } = syncRes.data.data;

        // ✅ Store token (optional: localStorage / sessionStorage)
        localStorage.setItem("token", token);

        // ✅ normalize dbUser before setting context
        // ✅ Update React context with synced user
        setUser({
          ...dbUser,
          hasPassword: true,
          provider: "appwrite",
        });

        navigate("/"); // redirect after successful login
      } else {
        alert("Failed to sync user: " + syncRes.data.data);
      }
    } catch (error: unknown) {
      console.log(error); // Failure
      alert(error || "Login failed");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleLogin}
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
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          autoComplete="email"
        />

        <TextField
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

        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>

        <Typography variant="body2" align="center">
          Don’t have an account? <Link to="/register-appwrite">Register</Link>
        </Typography>
        <Typography variant="caption" align="center">
          Powered by Appwrite
        </Typography>
      </Box>
    </>
  )
}

export default LoginAppwriteLogin