// src/pages/CheckoutSuccess.tsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { VariablesContext } from "../../context/VariablesContext";
import type { TransactionType } from "../../types/commerce.types";

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!globalParticipant?._id) 
        {
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
        setTransactions(res.data.data);
      } catch (err) {
        console.error("Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [globalParticipant?._id, setGlobalParticipant, url]);

  if (loading) return <p>Loading your purchase history...</p>;

  if (!globalParticipant?._id) {
    return <p>❌ No participant info found. Please log in again.</p>;
  }

  const lastTransaction = transactions[transactions.length - 1];

  return (
    <>
      <p>Your payment was successful.</p>  
      <div style={{ padding: "1rem" }}>
        <h2>✅ Thank you, {globalParticipant.name || "customer - guest"}!</h2>
        <p>Your payment was successful.</p>

        {lastTransaction ? (
          <>
            <h3>Last Purchase:</h3>
              <p>
                {new Date(lastTransaction.createdAt!).toLocaleString()}
              </p>
            <ul>

            </ul>
            <p>
              <strong>Total:</strong> {lastTransaction.amount}€
            </p>
            <p>✅ You will receive an email verification soon.</p>
          </>
        ) : (
          <p>You will receive an email verification soon.</p>
        )}
        
        {transactions.length > 1 && (
          <>
            <h3>Previous Purchases</h3>
            <ul>
              {transactions
                .slice(0, -1) // everything except last one
                .map((t, i) => (
                  <li key={t._id?.toString() || i} style={{ marginBottom: "1rem" }}>
                    <p><strong>{new Date(t.createdAt!).toLocaleString()}</strong></p>
                    <ul>
                      {t.items.map((item, idx) => (
                        <li key={idx}>
                          {item.commodity.name} × {item.quantity} — {item.priceAtPurchase}€
                        </li>
                      ))}
                    </ul>
                    <p><strong>Total:</strong> {t.amount}€</p>
                  </li>
                ))}
            </ul>
          </>
        )}
      </div>   
    </>

  );
};

export default CheckoutSuccess;
