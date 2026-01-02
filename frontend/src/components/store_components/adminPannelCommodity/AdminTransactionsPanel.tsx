// src/components/AdminTransactionsPanel.tsx
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
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { VariablesContext } from "../../../context/VariablesContext";
import { UserAuthContext } from "../../../context/UserAuthContext";
import type {
  TransactionType,
  ParticipantType,
} from "../../../types/commerce.types";
import AdminNotificationsMailer from "./AdminNotificationsMailer";

const AdminTransactionsPanel = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionType | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
        `${url}/api/transaction`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(res.data.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [url, setIsLoading]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, url]);

  const markProcessed = async (
    transactionId: string,
    transaction: TransactionType
  ) => {
    try {
      const token = localStorage.getItem("token");

      const { emailSubject, emailTextBody } = mailCreator(transaction);

      const res = await axios.put<{ status: boolean; data: TransactionType }>(
        `${url}/api/transaction/toggle/${transactionId}`,
        { emailSubject, emailTextBody },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Transaction toggled:", res.data.data);
      fetchTransactions(); // refresh list
    } catch (err) {
      console.error("Error toggling transaction:", err);
    }
  };

  const markConfirmed = async (transactionId: string) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/confirm/${transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTransactions();
  };

  const markShipped = async (transactionId: string) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/ship/${transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTransactions();
  };

  // αυτή η συνάρτηση που δημιουργεί μέηλ αφορούσε όταν είχαμε μόνο toggle processed και είναι πια depricated. δεν την σβήνουμε ομως γιατι την χρησιμοποιούμε σε dev περιβάλλον για δοκιμες
  const mailCreator = (transaction: TransactionType) => {
    const itemsList = transaction.items
      .map(
        (i) => `- ${i.commodity.name} × ${i.quantity} (${i.priceAtPurchase}€)`
      )
      .join("\n");

    const shipping = transaction.shipping
      ? `
  Shipping Info:
  ${transaction.shipping.fullName}
  ${transaction.shipping.addressLine1}
  ${transaction.shipping.addressLine2 || ""}
  ${transaction.shipping.postalCode}, ${transaction.shipping.city}
  ${transaction.shipping.country}
  Phone: ${transaction.shipping.phone}
  Notes: ${transaction.shipping.notes || "-"}
  `
      : "No shipping info provided.";

    const emailSubject = "Your order is being processed";
    const emailTextBody = `
  Your transaction is being processed. You will be notified shortly.

  Order Details:
  ${itemsList}

  ${shipping}

  Best regards,
  The Team
  `;

    console.log("emailSubject, emailTextBody", emailSubject, emailTextBody);

    return { emailSubject, emailTextBody };
  };

  const handleOpen = (t: TransactionType) => {
    setSelected(t);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>

      {isLoading && <p>Loading...</p>}

      {!isLoading && transactions.length === 0 && (
        <Typography>No transactions found.</Typography>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={showAll}
            onChange={() => setShowAll((prev) => !prev)}
            color="primary"
          />
        }
        label={
          showAll ? "Showing all transactions" : "Showing only unprocessed"
        }
      />
      <AdminNotificationsMailer />

      {!isLoading && transactions.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                  Name
                </TableCell>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                  Surname
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount (€)</TableCell>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                  Status
                </TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .filter((t) => showAll || !t.processed)
                .map((t) => {
                  const participant = t.participant as ParticipantType;
                  return (
                    <TableRow
                      key={t._id?.toString()}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleOpen(t)}
                    >
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        {participant?.name || "No Name"}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        {participant?.surname || "No Surname"}
                      </TableCell>
                      <TableCell>{participant?.email || "No Email"}</TableCell>
                      <TableCell>{t.amount} €</TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        {t.processed ? "Processed" : "Unprocessed"}
                      </TableCell>
                      <TableCell>
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : ""}
                      </TableCell>
                      <TableCell>
                        {t.status === "pending" && (
                          <Button
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              markConfirmed(t._id!.toString());
                            }}
                          >
                            Confirm & Send Email
                          </Button>
                        )}

                        {t.status === "confirmed" && (
                          <Button
                            size="small"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              markShipped(t._id!.toString());
                            }}
                          >
                            Mark Shipped
                          </Button>
                        )}
                        {/* <Button
                          variant={t.processed ? "outlined" : "contained"}
                          color={t.processed ? "warning" : "success"}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent row click
                            markProcessed(t._id!.toString(), t);
                          }}
                        >
                          {t.processed
                            ? "Mark Unprocessed"
                            : "Send Email & Mark Processed"}
                        </Button> */}
                        {t.processed && (
                          <Button
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              markProcessed(t._id!.toString(), t);
                            }}
                            title="DEV: reset transaction to pending"
                          >
                            <RestartAltIcon fontSize="small" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Transaction details dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <>
              <Typography variant="subtitle1">Items:</Typography>
              <List dense>
                {selected.items.map((item, idx) => {
                  console.log("🧪 TRANSACTION ITEM", idx, item);
                  // δεν θέλουμε στα variants να μας δείχνει το id
                  const variant = item.commodity?.variants?.find(
                    (v) => v._id === item.variantId
                  );

                  return (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={`${item.commodity.name} × ${item.quantity}`}
                        secondary={
                          <>
                            <span>{`${item.priceAtPurchase}€ each`}</span>
                            {item.variantId && variant && (
                              <>
                                <br />
                                <span>
                                  Variant:{" "}
                                  {Object.entries(variant.attributes)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </span>
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Shipping Info:
              </Typography>
              {selected.shipping ? (
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body2">
                    {selected.shipping.fullName}
                  </Typography>
                  <Typography variant="body2">
                    {selected.shipping.addressLine1}
                  </Typography>
                  {selected.shipping.addressLine2 && (
                    <Typography variant="body2">
                      {selected.shipping.addressLine2}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    {selected.shipping.postalCode}, {selected.shipping.city}
                  </Typography>
                  <Typography variant="body2">
                    {selected.shipping.country}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {selected.shipping.phone}
                  </Typography>
                  <Typography variant="body2">
                    Notes: {selected.shipping.notes}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">
                  No shipping info available.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* ===================== ADMIN TRANSACTIONS PANEL – INSTRUCTIONS ===================== */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Transactions
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • A <b>Transaction</b> is a completed order linked to a specific
          participant. The participant may be a logged-in user or a guest user
          created automatically.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Each transaction contains the list of purchased items, the total
          amount, the creation date, and—if provided—shipping information.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Use the <b>Show All / Show Only Unprocessed</b> switch to filter
          between orders that still require action and all historical orders.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Clicking a row opens the full transaction details: item list,
          quantities, prices, and the customer’s shipping data.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Clicking <b>"Send Email & Mark Processed"</b> sends a confirmation
          email to the buyer and marks the order as processed. This helps track
          which orders have already been handled.
        </Typography>

        <Typography variant="body2">
          • Marking a processed order as unprocessed simply changes its status
        </Typography>
      </Paper>
    </div>
  );
};

export default AdminTransactionsPanel;
