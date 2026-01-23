// frontend\src\components\AdminDeliveryPanel.tsx
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { VariablesContext } from "../context/VariablesContext";
import type { TransactionType, ParticipantType } from "../types/commerce.types";
import AdminDeliverySocketListener from "./admin_delivery_components/AdminDeliverySocketListener";

const AdminDeliveryPanel = () => {
  const { url } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeliveryTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get<{
        status: boolean;
        data: TransactionType[];
      }>(`${url}/api/transaction/cod`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data.data);
    } catch (err) {
      console.error("Error fetching COD transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchDeliveryTransactions();
  }, [fetchDeliveryTransactions]);

  useEffect(() => {
    console.log("🟡 AdminDeliverySocketListener MOUNT");
    return () => {
      console.log("🔴 AdminDeliverySocketListener UNMOUNT");
    };
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <AdminDeliverySocketListener onNewDelivery={fetchDeliveryTransactions} />

      <Typography variant="h4" gutterBottom>
        🚚 Delivery (COD)
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Παραγγελίες με πληρωμή κατά την παραλαβή που απαιτούν έγκριση.
      </Typography>

      {loading && <Typography>Loading…</Typography>}

      {!loading && transactions.length === 0 && (
        <Typography>Δεν υπάρχουν παραγγελίες delivery.</Typography>
      )}

      {!loading && transactions.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount (€)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {transactions.map((t) => {
                const participant = t.participant as ParticipantType;

                return (
                  <TableRow key={t._id?.toString()} hover>
                    <TableCell>
                      {participant?.name || "—"} {participant?.surname || ""}
                    </TableCell>

                    <TableCell>{participant?.email || "—"}</TableCell>

                    <TableCell>{t.amount} €</TableCell>

                    <TableCell>
                      {t.status}
                      {t.cancelled && " (cancelled)"}
                    </TableCell>

                    <TableCell>
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, color: "text.secondary" }}>
        <Typography variant="caption">
          ⏭️ Επόμενο βήμα: approve / reject + user waiting page sync
        </Typography>
      </Box>
    </Paper>
  );
};

export default AdminDeliveryPanel;
