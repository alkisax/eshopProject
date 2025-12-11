// frontend\src\components\store_components\CheckoutSuccess.tsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { VariablesContext } from "../../context/VariablesContext";
import type { TransactionType } from "../../types/commerce.types";

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      // 🟦 DEBUG
      console.log("⭐ globalParticipant at start:", globalParticipant);

      if (!globalParticipant?._id) {
        const storedId = localStorage.getItem("guestParticipantId");
        console.log("🟦 guestParticipantId from localStorage:", storedId);

        if (storedId) {
          axios.get(`${url}/api/participant/${storedId}`).then((res) => {
            console.log("🟦 Loaded participant from backend:", res.data.data);
            setGlobalParticipant(res.data.data);
          });
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");

        console.log("📡 Fetching transactions for participant:", globalParticipant._id);

        const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
          `${url}/api/transaction/participant/${globalParticipant._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("🔥 RAW TRANSACTIONS FROM BACKEND:", res.data.data);

        const sorted = res.data.data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        console.log("🔥 SORTED TRANSACTIONS:", sorted);

        // Επιβεβαιώνω ότι το πρώτο transaction έχει σωστά items
        if (sorted[0]) {
          console.log("🧪 ITEMS INSIDE FIRST TRANSACTION:", sorted[0].items);

          sorted[0].items.forEach((item, idx) => {
            console.log(`🧩 ITEM ${idx}:`, item);
            console.log("👉 commodity:", item.commodity);
            console.log("👉 images:", item.commodity?.images);
          });
        }

        setTransactions(sorted);
      } catch (err) {
        console.error("❌ Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [globalParticipant, globalParticipant?._id, setGlobalParticipant, url]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!globalParticipant?._id) {
    return <Typography color="error">❌ No participant info found. Please log in again.</Typography>;
  }

  const lastTransaction = transactions[0];

  // 🟦 DEBUG
  console.log("⭐ lastTransaction:", lastTransaction);

  if (lastTransaction?.items) {
    lastTransaction.items.forEach((item, idx) => {
      console.log(`🧩 (render) ITEM ${idx}:`, item);
      console.log("👉 (render) commodity:", item.commodity);
      console.log("👉 (render) images:", item.commodity?.images);
    });
  }

  return (
    <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: 5,
          maxWidth: 650,
          width: "100%",
          borderRadius: 4,
          background: "linear-gradient(135deg, #f9f9ff, #ffffff)",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
        }}
        elevation={0}
      >
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "success.main" }}
        >
          ✅ Ευχαριστούμε, {globalParticipant.name || "guest"}!
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Η πληρωμή σας ολοκληρώθηκε με επιτυχία 🎉
        </Typography>

        {lastTransaction && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" gutterBottom>
              🛍️ Τελευταία αγορά
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {new Date(lastTransaction.createdAt!).toLocaleString()}
            </Typography>

            <List dense>
              {lastTransaction.items.map((item, idx) => (
                <ListItem key={idx} sx={{ borderBottom: "1px dashed #ddd" }}>
                  {item.commodity.images && item.commodity.images?.length > 0 && (
                    <Box
                      component="img"
                      src={item.commodity.images[0]}
                      alt={item.commodity?.name}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        mr: 2,
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                  )}

                  <ListItemText
                    primary={`${item.commodity.name} × ${item.quantity}`}
                    secondary={`${item.priceAtPurchase}€ / τεμ.`}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" sx={{ mt: 2, textAlign: "right" }}>
              Σύνολο: {lastTransaction.amount}€
            </Typography>

            <Alert severity="success" sx={{ mt: 3, fontWeight: "bold" }}>
              📧 Θα λάβετε σύντομα επιβεβαίωση με email
            </Alert>
          </>
        )}

        {transactions.length > 1 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">📜 Προηγούμενες Αγορές</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {transactions.slice(1).map((t) => (
                    <ListItem key={t._id?.toString()}>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {new Date(t.createdAt!).toLocaleString()}
                        </Typography>

                        {t.items.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.commodity.name} × {item.quantity} — {item.priceAtPurchase}€
                          </Typography>
                        ))}

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Σύνολο:</strong> {t.amount}€
                        </Typography>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CheckoutSuccess;
