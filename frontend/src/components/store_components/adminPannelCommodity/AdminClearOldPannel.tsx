// frontend\src\components\store_components\adminPannelCommodity\AdminClearOldPannel.tsx
import { useState, useContext } from "react";
import { Button, Typography, Stack, Paper } from "@mui/material";
import axios from "axios";
import { VariablesContext } from "../../../context/VariablesContext";

const AdminClearOldPanel = () => {
  const { url } = useContext(VariablesContext);
  const [message, setMessage] = useState<string>("");

  const token = localStorage.getItem("token");

  const clearTransactions = async () => {
    try {
      const res = await axios.delete<{ status: boolean; message: string }>(
        `${url}/api/transaction/clear/old`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error clearing transactions");
    }
  };

  const clearCarts = async () => {
    try {
      const res = await axios.delete<{ status: boolean; message: string }>(
        `${url}/api/cart/clear/old`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error clearing carts");
    }
  };

  const clearGuests = async () => {
    try {
      const res = await axios.delete<{ status: boolean; message: string }>(
        `${url}/api/participant/clear/old-guests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error clearing guest participants");
    }
  };

  const clearUnapprovedComments = async () => {
    try {
      const res = await axios.delete<{ status: boolean; message: string }>(
        `${url}/api/commodity/comments/clear/old-unapproved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error clearing unapproved comments");
    }
  };

  const clearAll = async () => {
    await clearTransactions();
    await clearCarts();
    await clearGuests();
    await clearUnapprovedComments();
    setMessage("All cleanup endpoints executed.");
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Clear Old Data
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={clearTransactions}
          >
            Clear Old Transactions
          </Button>
          <Button variant="contained" color="primary" onClick={clearCarts}>
            Clear Old Carts
          </Button>
          <Button variant="contained" color="primary" onClick={clearGuests}>
            Clear Old Guest Participants
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={clearUnapprovedComments}
          >
            Clear Old Unapproved Comments
          </Button>
          <Button variant="contained" color="error" onClick={clearAll}>
            Clear All
          </Button>
        </Stack>

        {message && (
          <Typography sx={{ mt: 2 }} color="secondary">
            {message}
          </Typography>
        )}
      </Paper>

      {/* ===================== ADMIN CLEAR OLD DATA PANEL – INSTRUCTIONS ===================== */}
      <Paper
        sx={{ p: 2, mt: 4, backgroundColor: "#f7f7f7" }}
        variant="outlined"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Instructions – Clear Old Data
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • This panel removes **inactive or obsolete records** automatically
          determined by backend rules. These cleanup actions affect only old,
          unused, or already processed data.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Clear Old Transactions</b>: Deletes only <b>processed</b>{" "}
          transactions that are
          <b>older than 5 years</b>. This keeps the transaction table
          lightweight while preserving recent order history.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Clear Old Carts</b>: Deletes carts that have been **inactive for
          more than 5 days**. These are usually abandoned guest carts or user
          sessions that have expired.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Clear Old Guest Participants</b>: Removes guest participant
          accounts that are **older than 5 days** and no longer linked to any
          active cart or activity.
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • <b>Clear Old Unapproved Comments</b>: Deletes user comments in
          “pending approval” status that are **older than 5 days**. This
          prevents the moderation queue from being cluttered with stale content.
        </Typography>

        <Typography variant="body2">
          • <b>Clear All</b>: Executes all cleanup operations (transactions,
          carts, guests, comments). Safe to use periodically for maintenance,
          especially after development or testing phases.
        </Typography>
      </Paper>
    </>
  );
};

export default AdminClearOldPanel;
