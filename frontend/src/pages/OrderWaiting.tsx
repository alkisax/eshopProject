// frontend\src\pages\OrderWaiting.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { VariablesContext } from "../context/VariablesContext";
import { useLocation } from "react-router-dom";
import { useCheckout } from "../hooks/useCheckout";
import type { ShippingInfoType } from "../types/commerce.types";

const OrderWaiting = () => {
  // το url μας έχει ένα τοκεν που είναι ένα τυχαίο string που έρχετε απο το Back και το χρησιμοποιούμε για να ταυτοποιήσουμε την συναλάγή που είναι να εγγρηθεί
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  const { url } = useContext(VariablesContext);

  const location = useLocation();
  const stripeState = location.state as
    | { mode: "stripe"; shippingInfo: ShippingInfoType }
    | undefined;

  const { handleCheckout } = useCheckout();

  //Σε React ΔΕΝ χρησιμοποιούμε let interval στο body. Χρησιμοποιούμε useRef, γιατί: δεν προκαλεί re-render
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchStatus = async () => {
      try {
        // μου επιστρέφει το status του transaction pending/canceled/confirmed TODO να ελέξω αν το canceled flow είναι οκ
        const res = await axios.get(`${url}/api/transaction/status/${token}`);
        // κρατάω μόνο το status ή το cancelled που είναι Boolean
        const { status, cancelled } = res.data.data;

        if (cancelled) {
          navigate("/order-cancelled");
          return;
        }

        if (status === "confirmed") {
          // Stripe → checkout
          if (stripeState?.mode === "stripe") {
            handleCheckout(stripeState.shippingInfo);
            return;
          }

          // COD / IRIS
          navigate("/checkout-success");
          return;
        }

        setStatus(status);
        setLoading(false);
      } catch (err) {
        console.error("Polling failed", err);
      }
    };

    // πρώτη κλήση άμεσα
    fetchStatus();
    // polling ανα 3 δευτερολεπτα
    intervalRef.current = window.setInterval(fetchStatus, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, stripeState, navigate, url, handleCheckout]);

  //trigger Stripe μετά το admin approve
  useEffect(() => {
    if (stripeState?.mode === "stripe" && status === "confirmed") {
      handleCheckout(stripeState.shippingInfo);
    }
  }, [status, stripeState, handleCheckout]);

  // ⏳ loading UI
  if (loading) {
    return (
      <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          ⏳ Αναμονή επιβεβαίωσης παραγγελίας
        </Typography>

        <Typography color="text.secondary">
          Η παραγγελία σας έχει καταχωρηθεί και βρίσκεται σε έλεγχο.
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Κατάσταση: <strong>{status}</strong>
        </Typography>

        <CircularProgress sx={{ mt: 3 }} />
      </Paper>
    </Box>
  );
};

export default OrderWaiting;
