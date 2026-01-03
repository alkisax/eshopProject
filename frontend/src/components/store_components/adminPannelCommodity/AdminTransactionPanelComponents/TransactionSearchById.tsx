import { useState, useContext } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { VariablesContext } from "../../../../context/VariablesContext";
import type { TransactionType } from "../../../../types/commerce.types";

const TransactionSearchById = () => {
  const { url } = useContext(VariablesContext);

  const [transactionId, setTransactionId] = useState("");
  const [result, setResult] = useState<TransactionType | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!transactionId.trim()) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("token");

      const res = await axios.get<{ status: boolean; data: TransactionType }>(
        `${url}/api/transaction/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data.data);
    } catch (err) {
      setError("Transaction not found or invalid ID");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }} variant="outlined">
      <Typography variant="h6" gutterBottom>
        Search Transaction by ID
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          label="Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Box>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Transaction Details
          </Typography>

          <Typography variant="body2">
            <b>ID:</b> {result._id}
          </Typography>
          <Typography variant="body2">
            <b>Amount:</b> {result.amount} €
          </Typography>
          <Typography variant="body2">
            <b>Status:</b> {result.status}
          </Typography>
          <Typography variant="body2">
            <b>Processed:</b> {String(result.processed)}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <b>Created at:</b>{" "}
            {result.createdAt
              ? new Date(result.createdAt).toLocaleString()
              : "-"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* ITEMS */}
          <Typography variant="subtitle1">Items</Typography>
          <List dense>
            {result.items.map((item, idx) => {
              const variant = item.commodity?.variants?.find(
                (v) => v._id === item.variantId
              );

              return (
                <ListItem key={idx} alignItems="flex-start">
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

          <Divider sx={{ my: 2 }} />

          {/* SHIPPING */}
          <Typography variant="subtitle1">Shipping Info</Typography>
          {result.shipping ? (
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">
                {result.shipping.fullName}
              </Typography>
              <Typography variant="body2">
                {result.shipping.addressLine1}
              </Typography>
              {result.shipping.addressLine2 && (
                <Typography variant="body2">
                  {result.shipping.addressLine2}
                </Typography>
              )}
              <Typography variant="body2">
                {result.shipping.postalCode}, {result.shipping.city}
              </Typography>
              <Typography variant="body2">{result.shipping.country}</Typography>
              <Typography variant="body2">
                Phone: {result.shipping.phone}
              </Typography>
              {result.shipping.notes && (
                <Typography variant="body2">
                  Notes: {result.shipping.notes}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2">No shipping info available.</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default TransactionSearchById;
