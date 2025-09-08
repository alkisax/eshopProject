// src/pages/CheckoutSuccess.tsx
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
} from "@mui/material";
import { VariablesContext } from "../../context/VariablesContext";
import type { TransactionType } from "../../types/commerce.types";

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!globalParticipant?._id) {
        const storedId = localStorage.getItem("guestParticipantId");
        if (storedId) {
          axios.get(`${url}/api/participant/${storedId}`).then(res => {
            setGlobalParticipant(res.data.data);
          });
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
          `${url}/api/transaction/participant/${globalParticipant._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // sort transactions by createdAt DESC
        const sorted = res.data.data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        setTransactions(sorted);
      } catch (err) {
        console.error("Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [globalParticipant?._id, setGlobalParticipant, url]);

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

  // after sorting, latest is at index 0
  const lastTransaction = transactions[0];

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, maxWidth: 600, width: "100%" }} elevation={3}>
        <Typography variant="h4" gutterBottom>
          ✅ Thank you, {globalParticipant.name || "guest"}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your payment was successful.
        </Typography>

        {lastTransaction && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Last Purchase</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {new Date(lastTransaction.createdAt!).toLocaleString()}
            </Typography>
            <List dense>
              {lastTransaction.items.map((item, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${item.commodity.name} × ${item.quantity}`}
                    secondary={`${item.priceAtPurchase}€ each`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              <strong>Total:</strong> {lastTransaction.amount}€
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "success.main" }}>
              ✅ You will receive an email verification soon.
            </Typography>
          </>
        )}

        {transactions.length > 1 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Previous Purchases</Typography>
            <List dense>
              {/* slice from index 1 onward */}
              {transactions
                .slice(1)
                .map((t) => (
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
                        <strong>Total:</strong> {t.amount}€
                      </Typography>
                    </Stack>
                  </ListItem>
                ))}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CheckoutSuccess;


// // src/pages/CheckoutSuccess.tsx
// import { useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { VariablesContext } from "../../context/VariablesContext";
// import type { TransactionType } from "../../types/commerce.types";

// const CheckoutSuccess = () => {
//   const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext);
//   const [transactions, setTransactions] = useState<TransactionType[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       if (!globalParticipant?._id) 
//         {
//         const storedId = localStorage.getItem("guestParticipantId");
//         if (storedId) {
//           axios.get(`${url}/api/participant/${storedId}`).then(res => {
//             setGlobalParticipant(res.data.data);
//           });
//         }
//         return;
//       }

//       try {
//         const token = localStorage.getItem("token");  
//         const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
//           `${url}/api/transaction/participant/${globalParticipant._id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setTransactions(res.data.data);
//       } catch (err) {
//         console.error("Error fetching transactions", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, [globalParticipant?._id, setGlobalParticipant, url]);

//   if (loading) return <p>Loading your purchase history...</p>;

//   if (!globalParticipant?._id) {
//     return <p>❌ No participant info found. Please log in again.</p>;
//   }

//   const lastTransaction = transactions[transactions.length - 1];

//   return (
//     <>
//       <p>Your payment was successful.</p>  
//       <div style={{ padding: "1rem" }}>
//         <h2>✅ Thank you, {globalParticipant.name || "customer - guest"}!</h2>
//         <p>Your payment was successful.</p>

//         {lastTransaction ? (
//           <>
//             <h3>Last Purchase:</h3>
//               <p>
//                 {new Date(lastTransaction.createdAt!).toLocaleString()}
//               </p>
//             <ul>

//             </ul>
//             <p>
//               <strong>Total:</strong> {lastTransaction.amount}€
//             </p>
//             <p>✅ You will receive an email verification soon.</p>
//           </>
//         ) : (
//           <p>You will receive an email verification soon.</p>
//         )}
        
//         {transactions.length > 1 && (
//           <>
//             <h3>Previous Purchases</h3>
//             <ul>
//               {transactions
//                 .slice(0, -1) // everything except last one
//                 .map((t, i) => (
//                   <li key={t._id?.toString() || i} style={{ marginBottom: "1rem" }}>
//                     <p><strong>{new Date(t.createdAt!).toLocaleString()}</strong></p>
//                     <ul>
//                       {t.items.map((item, idx) => (
//                         <li key={idx}>
//                           {item.commodity.name} × {item.quantity} — {item.priceAtPurchase}€
//                         </li>
//                       ))}
//                     </ul>
//                     <p><strong>Total:</strong> {t.amount}€</p>
//                   </li>
//                 ))}
//             </ul>
//           </>
//         )}
//       </div>   
//     </>

//   );
// };

// export default CheckoutSuccess;
