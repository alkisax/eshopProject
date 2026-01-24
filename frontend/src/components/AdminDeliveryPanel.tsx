// frontend\src\components\AdminDeliveryPanel.tsx
import { useEffect, useState, useContext, useCallback, Fragment } from "react";
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
// import AdminDeliverySocketListener from "./admin_delivery_components/AdminDeliverySocketListener";
import TransactionDetailsDialog from "./store_components/adminPannelCommodity/AdminTransactionPanelComponents/TransactionDetailsDialog";
import TransactionRowActions from "./store_components/adminPannelCommodity/AdminTransactionPanelComponents/TransactionRowActions";

const AdminDeliveryPanel = () => {
  const { url } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionType | null>(null);

  const fetchDeliveryTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get<{
        status: boolean;
        data: TransactionType[];
      }>(`${url}/api/transaction`, {
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

  // // socket debug logger
  // useEffect(() => {
  //   console.log("🟡 AdminDeliverySocketListener MOUNT");
  //   return () => {
  //     console.log("🔴 AdminDeliverySocketListener UNMOUNT");
  //   };
  // }, []);

  // για να αλλάζειτο χρώμα της κάθε σειρας
  const getRowBgColor = (t: TransactionType) => {
    if (t.cancelled) return "rgba(244, 67, 54, 0.08)"; // light red
    if (t.status === "pending") return "rgba(33, 150, 243, 0.08)"; // light blue
    if (t.status === "confirmed") return "rgba(76, 175, 80, 0.10)"; // light green
    return "transparent";
  };

  // για το popup των transactions
  const handleOpen = (t: TransactionType) => {
    setSelected(t);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  // για να κάνουμε τα action btns σε κάθε σειρά
  const markConfirmed = async (id: string) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/confirm/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchDeliveryTransactions();
  };

  const markShipped = async (id: string) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/ship/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchDeliveryTransactions();
  };

  // για να τις διαχωρίζουμε ημερολογιακά (safe)
  const grouped = transactions.reduce<Record<string, TransactionType[]>>(
    (acc, t) => {
      if (!t.createdAt) return acc; // 👈 TS + runtime safe

      const day = new Date(t.createdAt).toISOString().slice(0, 10);
      acc[day] = acc[day] || [];
      acc[day].push(t);
      return acc;
    },
    {},
  );

  return (
    <>
      <Paper sx={{ p: 3 }}>
        {/* <AdminDeliverySocketListener
          onNewDelivery={fetchDeliveryTransactions}
        /> */}

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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {Object.entries(grouped).map(([day, txs]) => (
                  <Fragment key={day}>
                    {/* ημερολογιακό divider */}
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          bgcolor: "grey.100",
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(day).toLocaleDateString("el-GR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>

                    {/* transactions της ημέρας */}
                    {txs.map((t) => {
                      const participant = t.participant as ParticipantType;

                      return (
                        <TableRow
                          key={t._id?.toString()}
                          hover
                          sx={{
                            cursor: "pointer",
                            backgroundColor: getRowBgColor(t),
                          }}
                          onClick={() => handleOpen(t)}
                        >
                          <TableCell>
                            {participant?.name || "—"}{" "}
                            {participant?.surname || ""}
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

                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <TransactionRowActions
                              transaction={t}
                              onConfirm={markConfirmed}
                              onShip={markShipped}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))}
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

      <TransactionDetailsDialog
        open={open}
        transaction={selected}
        onClose={handleClose}
      />
    </>
  );
};

export default AdminDeliveryPanel;
