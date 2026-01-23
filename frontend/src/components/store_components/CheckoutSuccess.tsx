// frontend\src\components\store_components\CheckoutSuccess.tsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
import type { CartItemType, TransactionType } from "../../types/commerce.types";
import LastTransactionSummary from "./checkout_components/LastTransactionSummary";
import PreviousTransactionsAccordion from "./checkout_components/PreviousTransactionsAccordion";

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } =
    useContext(VariablesContext);
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

        console.log(
          "📡 Fetching transactions for participant:",
          globalParticipant._id,
        );

        const endpoint = token ? `${url}/api/transaction/my` : null;

        if (!endpoint) {
          setTransactions([]);
          return;
        }

        const res = await axios.get<{
          status: boolean;
          data: TransactionType[];
        }>(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔥 RAW TRANSACTIONS FROM BACKEND:", res.data.data);

        const sorted = res.data.data.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
        );

        console.log("🔥 SORTED TRANSACTIONS:", sorted);

        // Επιβεβαιώνω ότι το πρώτο transaction έχει σωστά items
        if (sorted[0]) {
          console.log("🧪 ITEMS INSIDE FIRST TRANSACTION:", sorted[0].items);

          sorted[0].items.forEach((item, idx) => {
            console.log(`🧩 ITEM ${idx}:`, item);
            console.log("👉 commodity:", item.commodity);
            // console.log("👉 images:", item.commodity?.images);
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
    return (
      <Typography color="error">
        ❌ No participant info found. Please log in again.
      </Typography>
    );
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

  // variants
  const getVariantLabel = (item: CartItemType): string | null => {
    if (!item.variantId || !item.commodity?.variants) return null;

    const variant = item.commodity.variants.find((v) => {
      const vid = v._id?.toString?.() ?? v._id;
      return vid === item.variantId;
    });

    if (!variant?.attributes) return null;

    return Object.entries(variant.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  };

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
          <LastTransactionSummary
            lastTransaction={lastTransaction}
            getVariantLabel={getVariantLabel}
          />
        )}

        <PreviousTransactionsAccordion
          transactions={transactions}
          getVariantLabel={getVariantLabel}
        />
      </Paper>
    </Box>
  );
};

export default CheckoutSuccess;
