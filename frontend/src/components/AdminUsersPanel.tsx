// frontend\src\components\AdminUsersPanel.tsx
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import { VariablesContext } from "../context/VariablesContext";
import { UserAuthContext } from "../context/UserAuthContext";
import ProfileUser from "../pages/ProfileUser";
import Loading from "./Loading";
import type { IUser } from "../types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { TransactionType } from "../types/commerce.types";
import UserTransactionsList from "./store_components/adminPannelCommodity/AdminTransactionPanelComponents/UserTransactionsList";

const AdminPanel = () => {
  // const { user, setUser, isLoading, setIsLoading, refreshUser } = useContext(UserAuthContext);
  const { isLoading } = useContext(UserAuthContext);
  const { url } = useContext(VariablesContext);

  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [viewUser, setViewUser] = useState<IUser | null>(null);
  const [orders, setOrders] = useState<TransactionType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const users = await axios.get(`${url}/api/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(users);

      // setUsers(users.data.data)
      const hiddenEmails = ["alkisax@gmail.com", "upload@eshop.local"];

      setUsers(
        users.data.data.filter((u: IUser) => !hiddenEmails.includes(u.email))
      );
    } catch {
      console.log("error fetching all users");
    }
  }, [url]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers, url]);

  const handleDelete = async (user: IUser) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    const userId = user._id || user.id;
    if (!userId) return alert("User ID not found");

    try {
      const token = localStorage.getItem("token");

      // 1. Delete comments
      try {
        await axios.delete(`${url}/api/commodity/comments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 2. Delete Appwrite user (ignore if not found)
        await axios.delete(`${url}/api/users/appwrite-delete`, {
          data: { email: user.email },
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.warn("No Appwrite account for this user, skipping");
        } else {
          throw err; // only rethrow if it's a real error
        }
      }

      // 3. Delete Mongo user
      await axios.delete(`${url}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAllUsers();
      // setUsers(users.filter(u => u._id !== userId));
      alert("User deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const handleToggleAdmin = async (user: IUser) => {
    console.log("IUser, ", user);

    const token = localStorage.getItem("token");
    if (!token) return;

    // normalize the id for the request
    const userId = user._id || user.id;
    if (!userId) return alert("User ID not found");

    try {
      const res = await axios.put(
        `${url}/api/users/toggle-admin/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data.data;
      console.log("updatedd user: ", updatedUser);

      if (res.data.status) {
        // update local state
        setUsers((prev) =>
          prev.map((u) =>
            (u._id || u.id) === (updatedUser._id || updatedUser.id)
              ? res.data.data
              : u
          )
        );
        alert(
          `Admin privileges ${
            updatedUser.roles.includes("USER") ? "removed" : "granted"
          }`
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update roles");
    }
  };

  const fetchUserOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");

      const p = await axios.get(
        `${url}/api/participant/by-email?email=${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(
        `${url}/api/transaction/participant/${p.data.data._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Panel
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Name
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                Username
              </TableCell>
              <TableCell>Roles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* το React.Fragment έπρεπε να προστεθεί γιατί έχει δύο αντικείμενα μέσα του */}
            {users.map((user, idx) => (
              <React.Fragment key={user.id}>
                <TableRow
                  sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
                >
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {user.username}
                  </TableCell>
                  <TableCell>{user.roles.join(", ")}</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f4fdffff" }}>
                  <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setSelectedUser(user)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setViewUser(user);
                          fetchUserOrders(user.email);
                        }}
                      >
                        View More
                      </Button>
                      <Button
                        variant="contained"
                        color={
                          user.roles.includes("ADMIN") ? "warning" : "success"
                        }
                        size="small"
                        onClick={() => handleToggleAdmin(user)}
                      >
                        {user.roles.includes("ADMIN")
                          ? "Remove Admin"
                          : "Make Admin"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Modal */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Update User
          <IconButton
            aria-label="close"
            onClick={() => setSelectedUser(null)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedUser && <ProfileUser userToEdit={selectedUser} />}
        </DialogContent>
      </Dialog>

      {/* View More Modal */}
      <Dialog
        open={!!viewUser}
        onClose={() => {
          setViewUser(null);
          setOrders([]); // reset
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>

        <DialogContent dividers>
          {viewUser && (
            <>
              <Stack spacing={1}>
                <Typography>
                  <b>ID:</b> {viewUser._id || viewUser.id}
                </Typography>
                <Typography>
                  <b>Name:</b> {viewUser.name}
                </Typography>
                <Typography>
                  <b>Email:</b> {viewUser.email}
                </Typography>
                <Typography>
                  <b>Username:</b> {viewUser.username || "—"}
                </Typography>
                <Typography>
                  <b>Roles:</b> {viewUser.roles.join(", ")}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Previous Transactions</Typography>
              {loadingOrders ? (
                <Typography>Loading orders…</Typography>
              ) : (
                <UserTransactionsList orders={orders} showTransactionId />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ADMIN USERS PANEL – INSTRUCTIONS */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Users Administration
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Here you can view all registered users of the platform.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Update</b>: Opens a panel where you can edit user information
          (name, username, email).
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Delete</b>: Removes the user permanently. All comments associated
          with this user are also removed.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>View More</b>: Shows extended user details such as ID, roles, and
          profile data.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Make Admin / Remove Admin</b>: Toggles administrator privileges.
          Admins have full access to all dashboard features.
        </Typography>
        <Typography variant="body2">
          • The list refreshes automatically after each action. You can reload
          manually via page refresh if needed.
        </Typography>
      </Paper>
    </>
  );
};
export default AdminPanel;
