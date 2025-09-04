// src/components/admin/AdminParticipantsPanel.tsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { VariablesContext } from "../../../context/VariablesContext";
import type { ParticipantType } from "../../../types/commerce.types";
import { UserAuthContext } from "../../../context/UserAuthContext";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Typography, Paper
} from "@mui/material";

const AdminParticipantsPanel = () => {
  const { url } = useContext(VariablesContext);
  const { isLoading, setIsLoading } = useContext(UserAuthContext);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<{ status: boolean; data: ParticipantType[] }>(
          `${url}/api/participant`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setParticipants(res.data.data);
      } catch (err) {
        console.error("Error fetching participants:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParticipants();
  }, [setIsLoading, url]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (participants.length === 0) {
    return <Typography>No participants found</Typography>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Participants
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Surname</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participants.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.email}</TableCell>
              <TableCell>{p.name || "-"}</TableCell>
              <TableCell>{p.surname || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AdminParticipantsPanel;
