import axios from "axios"
// import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react"
import { Box, Button, TextField, Typography, Paper, Stack } from "@mui/material"
import { UserAuthContext } from "../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import { frontendValidatePassword } from "../utils/registerBackend";
import Loading from '../components/Loading'
import type { UpdateUser, IUser } from "../types/types";

interface Props {
  userToEdit?: IUser;
}

const ProfileUser = ({ userToEdit }: Props) => {
  const { user, setUser, isLoading, setIsLoading, refreshUser } = useContext(UserAuthContext);
  const { url } = useContext(VariablesContext)

  // αυτο το component καλείτε και απο το adminpanel στο edit. εκει θα πρέπει να μπορούμε να αλλάξουμε και έναν άλλο χρίστη περα απο αυτό που είναι logedin
  const targetUser = userToEdit ?? user;

  const [username, setUsername] = useState<string>(targetUser?.username || "");
  const [name, setName] = useState<string>(targetUser?.name || "");
  const [email, setEmail] = useState<string>(targetUser?.email || "");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastProvider, setLastProvider] = useState<string>('none')

  const [userId, setUserId] = useState<string>(targetUser?._id || "");
  const [hasPassword, setHasPassword] = useState<boolean>(!!targetUser?.hasPassword);

  // const navigate = useNavigate();
  // Decide whether we're editing current user or admin target


  useEffect(() => {
    setLastProvider(user?.provider ?? 'none');
  }, [user]);

  useEffect(() => {
    if (targetUser) {
      setUsername(targetUser.username || "");
      setName(targetUser.name || "");
      setEmail(targetUser.email || "");
      setLastProvider(targetUser.provider || "none");
      setUserId(targetUser._id || "");
      setHasPassword(!!targetUser.hasPassword);
    }
  }, [targetUser]);

  if (!targetUser || isLoading) {
    return (
      <Loading />
    )
  };

  const handleUpdateUserBackend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // reset previous error

    const updatePayload: UpdateUser = {};

    if (username) updatePayload.username = username;
    if (name) updatePayload.name = name;
    if (password) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setIsLoading(false);
        return;
      }
      const passError = frontendValidatePassword(password);
      if (passError) {
        setErrorMessage(passError);
        setIsLoading(false);
        return;
      }
      updatePayload.password = password      
    }

    // If no fields were filled, return error
    if (Object.keys(updatePayload).length === 0) {
      setErrorMessage("Please provide at least one field to update");
      setIsLoading(false);
      return;
    }

    const userId = targetUser._id || targetUser.id;
    if (!userId) {
      setErrorMessage("**ERROR** no user id");
      setIsLoading(false);
      return;      
    } 

    try {
      const res = await axios.put(`${url}/api/users/${userId}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.status) {
        const updatedUser = res.data.data;
        setUser(updatedUser);

        // Immediately update local state
        setUserId(updatedUser._id || "");
        setUsername(updatedUser.username || "");
        setName(updatedUser.name || "");
        setEmail(updatedUser.email || "");
        setHasPassword(!!updatedUser.hasPassword);
        setLastProvider(updatedUser.provider || lastProvider);

        alert("Profile updated successfully 🚀");
        if (refreshUser) { // ts null check
          await refreshUser();// refresh the context
        } 
        // navigate("/");
      } else {
        setErrorMessage(res.data.error || res.data.data || "Update failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMsg = err.response?.data?.error || err.response?.data?.message;
        if (backendMsg) {
          setErrorMessage(Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg);
        } else {
          setErrorMessage("An unknown error occurred during update");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unknown error occurred during update");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Paper sx={{ p: 4, width: 400 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Upadate user info
          </Typography>

          <Box component="form" onSubmit={handleUpdateUserBackend} noValidate>
            <Stack spacing={2}>
              {/* ID (read-only) */}
              <TextField
                label="User ID"
                value={userId || ""}
                fullWidth
                disabled
              />

              {/* password? (read-only) */}
              <TextField
                label="password"
                value={hasPassword  ? "Yes" : "No"}
                fullWidth
                disabled
              />

              {/* Email (read-only) */}
              <TextField
                label="Email"
                type="email"
                value={email}
                fullWidth
                disabled
              />
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
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

              {(lastProvider !== 'appwrite') && 
                <>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: '1px solid rgba(188, 229, 251, 1)',
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    <Stack spacing={2}>
                      <p>Add or change password</p>
                      <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        fullWidth
                      />
                      <TextField
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        fullWidth
                      />                         
                    </Stack>
                    
                  </Paper>
                </>
              }

              <TextField
                label="last provider"
                value={lastProvider}
                fullWidth
                disabled
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
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? "Loading..." : "Update Profile"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  )
}
export default ProfileUser