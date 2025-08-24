import { useContext, useEffect, useState } from "react"
import axios from 'axios'
import React from "react";
import { VariablesContext } from "../context/VariablesContext";
import { UserAuthContext } from "../context/UserAuthContext";
import ProfileUser from "../pages/ProfileUser";
import Loading from './Loading'
import type { IUser } from "../types/types";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
  Stack, Typography,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AdminPanel = () => {
    // const { user, setUser, isLoading, setIsLoading, refreshUser } = useContext(UserAuthContext);
    const { isLoading } = useContext(UserAuthContext);
    const { url } = useContext(VariablesContext)

    const [users, setUsers] = useState<IUser[]>([])
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [viewUser, setViewUser] = useState<IUser | null>(null);



    useEffect(() => {
      const fetchAllUsers = async () => {
        try {
        const token = localStorage.getItem("token");
        const users = await axios.get(`${url}/api/users/`, {
          headers: { Authorization: `Bearer ${token}`},
        })
        console.log(users);
        
        setUsers(users.data.data)
        } catch {
          console.log('error fetching all users');        
        }
      }

      fetchAllUsers()
    }, [url])

    
    const handleDelete = async (user: IUser) => {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }

      const userId = user._id || user.id;
      if (!userId) return alert("User ID not found");

      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${url}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== userId));
        alert("User deleted");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Delete failed");
      }
    };

    const handleToggleAdmin = async (user: IUser) => {
      console.log('IUser, ', user);
      
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
        console.log('updatedd user: ', updatedUser);
        

        if (res.data.status) {
          // update local state
          setUsers(prev => prev.map(u => (u._id || u.id) === (updatedUser._id || updatedUser.id) ? res.data.data : u));
          alert(`Admin privileges ${updatedUser.roles.includes("USER") ? "removed" : "granted"}`);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to update roles");
      }
    };

    if (isLoading) {
      return (
        <Loading />
      )
    }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Panel</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Roles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* το React.Fragment έπρεπε να προστεθεί γιατί έχει δύο αντικείμενα μέσα του */}
            {users.map((user, idx) => (
            <React.Fragment key={user.id}>  

              <TableRow sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.roles.join(", ")}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f4fdffff" }}>
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                      onClick={() => setViewUser(user)}
                    >
                      View More
                    </Button>
                    <Button
                      variant="contained"
                      color={user.roles.includes("ADMIN") ? "warning" : "success"}
                      size="small"
                      onClick={() => handleToggleAdmin(user)}
                    >
                      {user.roles.includes("ADMIN") ? "Remove Admin" : "Make Admin"}
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
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Update User
          <IconButton
            aria-label="close"
            onClick={() => setSelectedUser(null)}
            sx={{
              position: 'absolute',
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
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Stack spacing={1}>
              <Typography><b>ID:</b> {viewUser.id}</Typography>
              <Typography><b>Name:</b> {viewUser.name}</Typography>
              <Typography><b>Email:</b> {viewUser.email}</Typography>
              <Typography><b>Username:</b> {viewUser.username}</Typography>
              <Typography><b>Roles:</b> {viewUser.roles.join(", ")}</Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
export default AdminPanel