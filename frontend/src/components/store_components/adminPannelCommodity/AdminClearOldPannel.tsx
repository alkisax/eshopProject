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
      const res = await axios.delete<{ status: boolean, message: string }>(
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
      const res = await axios.delete<{ status: boolean, message: string }>(
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
      const res = await axios.delete<{ status: boolean, message: string }>(
        `${url}/api/participant/clear/old-guests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error clearing guest participants");
    }
  };

  const clearAll = async () => {
    await clearTransactions();
    await clearCarts();
    await clearGuests();
    setMessage("All cleanup endpoints executed.");
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Clear Old Data
      </Typography>
      <Stack spacing={2}>
        <Button variant="contained" color="primary" onClick={clearTransactions}>
          Clear Old Transactions
        </Button>
        <Button variant="contained" color="primary" onClick={clearCarts}>
          Clear Old Carts
        </Button>
        <Button variant="contained" color="primary" onClick={clearGuests}>
          Clear Old Guest Participants
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
  );
};

export default AdminClearOldPanel;
