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
} from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
import { UserAuthContext } from "../../context/UserAuthContext";
import type { TransactionType, ParticipantType } from "../../types/commerce.types";

const AdminTransactionsPanel = () => {
  const { url } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [showAll, setShowAll] = useState(false);

  //useCallback tells React: “Please remember this function.Only give me a new one if something in its dependencies changes.”
  // το κάναμε και αλλου αυτό. το πρόβλημα είναι οτι αν είναι εκτός του dependency aray της useEffect έχω worning, αλλα πρέπει να μείνει και εκτός γιατι την χρησιμοποιώ και αλλου
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

  const markProcessed = async (transactionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put<{ status: boolean; data: TransactionType }>(
        `${url}/api/transaction/toggle/${transactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Transaction toggled:", res.data.data);
      fetchTransactions(); // refresh list
    } catch (err) {
      console.error("Error toggling transaction:", err);
    }
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
        label={showAll ? "Showing all transactions" : "Showing only unprocessed"}
      />

      {!isLoading && transactions.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Surname</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount (€)</TableCell>
                <TableCell>Status</TableCell>
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
                    <TableRow key={t._id?.toString()}>
                      <TableCell>{participant?.name || "No Name"}</TableCell>
                      <TableCell>{participant?.surname || "No Surname"}</TableCell>
                      <TableCell>{participant?.email || "No Email"}</TableCell>
                      <TableCell>{t.amount} €</TableCell>
                      <TableCell>
                        {t.processed ? "Processed" : "Unprocessed"}
                      </TableCell>
                      <TableCell>
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : ""}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={t.processed ? "outlined" : "contained"}
                          color={t.processed ? "warning" : "success"}
                          size="small"
                          onClick={() => markProcessed(t._id!.toString())}
                        >
                          {t.processed
                            ? "Mark Unprocessed"
                            : "Send Email & Mark Processed"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default AdminTransactionsPanel;
