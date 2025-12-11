// src/components/admin/AdminParticipantsPanel.tsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { VariablesContext } from "../../../context/VariablesContext";
import type { ParticipantType } from "../../../types/commerce.types";
import { UserAuthContext } from "../../../context/UserAuthContext";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Typography,
  Paper,
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
        const res = await axios.get<{
          status: boolean;
          data: ParticipantType[];
        }>(`${url}/api/participant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <>
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
      {/* ===================== ADMIN PARTICIPANTS PANEL – INSTRUCTIONS ===================== */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Participants
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • A <b>Participant</b> represents the actual buyer in the system. This
          is required because purchases may be made by both logged-in users and
          visitors.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • When a logged-in user adds an item to the cart, the system checks if
          they already have an associated participant. If not, a new one is
          created automatically.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • When a visitor adds items to the cart, the system creates a
          temporary guest participant (with a UUID email). The guest participant
          ID is stored in <b>localStorage</b> so the cart persists while
          browsing.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • The <b>Participants Panel</b> displays all participants — both
          user-linked and guest-generated. Each participant contains name,
          surname, email και πληροφορίες που σχετίζονται με το cart ή με
          μελλοντικές συναλλαγές.
        </Typography>

        <Typography variant="body2">
          • This list is read-only. Participants are auto-managed by the system
          and should not be manually edited or deleted unless για debugging ή
          data clean-up.
        </Typography>
      </Paper>
    </>
  );
};

export default AdminParticipantsPanel;
