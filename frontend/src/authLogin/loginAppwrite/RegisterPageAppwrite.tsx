
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { account } from "../../lib/appwriteConfig";
import { ID } from "appwrite";
import { Box, Button, TextField, Typography, Paper, Stack } from "@mui/material";

const RegisterPageAppwrite = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate()

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length < minLength) return "Password must be at least 6 characters";
    if (!hasUppercase) return "Password must contain at least one uppercase letter";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    return ""; // valid
  };

  // Email validation regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email address";
    return ""; // valid
  };


  const handleRegister = async (event: { preventDefault: () => void; }) => {
    setLoading(true)
    event.preventDefault();
    setErrorMessage(""); // reset previous error

    const passError = validatePassword(password);
    if (passError) {
      setErrorMessage(passError);
      setLoading(false);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      setLoading(false);
      return;
    }
    if (!username || !name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Call Appwrite function to handle user registration
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setLoading(false)
        return;
      }
      if (
        username === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
      ) {
        alert("Please fill in all fields");
        setLoading(false);
        return;
      }

      // appwrite Register functionality 👇
      if (password.length < 8) {
        alert("Password must contain 8 characters");
        setLoading(false);
        return;
      }

      const promise = account.create(ID.unique(), email, password, username);

      promise.then(
        function (response) {
          console.log(response); // Success
          alert("Account Created Successfully 🚀");
          navigate("/");
        },
        function (error) {
          console.log(error); // Failure
          alert(error);
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Paper sx={{ p: 4, width: 400 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Register
          </Typography>

          <Box component="form" onSubmit={handleRegister} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />

              {errorMessage && (
                <Typography variant="body2" color="error" align="center">
                  {errorMessage}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? "Loading..." : "Register"}
              </Button>

              <Typography variant="body2" align="center">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>      
    </>
  );
};

export default RegisterPageAppwrite;