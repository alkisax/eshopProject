import { useContext, useEffect, useState } from "react"
import axios from 'axios'
import React from "react";
import { VariablesContext } from "../context/VariablesContext";
import { UserAuthContext } from "../context/UserAuthContext";
import Loading from '../components/Loading'
import type { IUser } from "../types/types";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
  Stack, Typography
} from "@mui/material";

const AdminPanel = () => {
    // const { user, setUser, isLoading, setIsLoading, refreshUser } = useContext(UserAuthContext);
    const { isLoading, refreshUser } = useContext(UserAuthContext);
    const { url } = useContext(VariablesContext)

    const [users, setUsers] = useState<IUser[]>([])
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [viewUser, setViewUser] = useState<IUser | null>(null);

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

    useEffect(() => {
      fetchAllUsers()
    }, [])

    
    const handleDelete = async (userId: string) => {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }

      try {
        await axios.delete(`${url}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUsers(users.filter(user => user._id !== userId));
        alert("User deleted");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Delete failed");
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
            {users.map((user, idx) => (
            <React.Fragment key={user._id}>

              <TableRow key={user._id} sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.roles.join(", ")}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f4fdffff" }}>
                <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="contained" color="primary" size="small" onClick={() => setSelectedUser(user)}>Update</Button>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(user._id!)}>Delete</Button>
                    <Button variant="outlined" size="small" onClick={() => setViewUser(user)}>View More</Button>
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
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          {selectedUser && <ProfileUser url={url} />}
        </DialogContent>
      </Dialog>

      {/* View More Modal */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Stack spacing={1}>
              <Typography><b>ID:</b> {viewUser._id}</Typography>
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