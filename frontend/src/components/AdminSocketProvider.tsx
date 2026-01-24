// frontend\src\components\AdminSocketProvider.tsx
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AdminSocketContext } from "../context/AdminSocketContext";
import type { TxCreatedPayload } from "../context/AdminSocketContext";
import { useContext } from "react";
import { VariablesContext } from "../context/VariablesContext";
import axios from "axios";
import AdminDeliveryAlert from "./admin_delivery_components/AdminDeliveryAlert";

type Props = {
  children: React.ReactNode;
};

const AdminSocketProvider = ({ children }: Props) => {
  const { url } = useContext(VariablesContext);
  // το ref δεν προκαλεί rerender οπως το useState. το αρχικοποιούμε εδώ και παρακάτω του δίνουμε τιμή με πχ socketRef.current = socket;
  const socketRef = useRef<Socket | null>(null);

  const [lastDelivery, setLastDelivery] = useState<TxCreatedPayload | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ενα log πριν για να δούμε πως μπήκαμε στο useEffect
    console.log("🟢 AdminSocketProvider MOUNT");

    // Εδω δημιουργείται μία σύνδεση και authenticated
    const socket = io(url, {
      auth: { token },
      transports: ["websocket"],
    });

    // το αποθηκεύουμε
    socketRef.current = socket;

    // log μετα για να δούμε αν πετυχε ή οχι
    socket.on("connect", () => {
      console.log("🟢 Admin socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Admin socket error:", err.message);
    });

    // αυτό είναι το συμαντικό
    /*
    στο backend create transaction controller εχουμε
    io.to('admins').emit('transaction:created', {
      transactionId: newTransaction._id.toString(),
      status: newTransaction.status,
      sessionId: newTransaction.sessionId,
      createdAt: newTransaction.createdAt,
      publicTrackingToken: newTransaction.publicTrackingToken,
    });
    εδώ είναι που δημιουργήτε το .emit 'transaction:created'
    Ποιος “μιλάει” και ποιος “ακούει”
    Backend (server) → μιλάει: io.to('admins').emit('transaction:created', payload);
    Frontend (admin browser) → ακούει: socket.on('transaction:created', (payload) => {});
    οπότε στο .on ακούει μύνημα απο τον σερβερ «Κάτι ΣΥΝΕΒΗ μόλις» και το alert ενεργοποιείτε μέσο του .provider (παρακάτω)
    Όταν ο backend κάνει:
    io.to('admins').emit('transaction:created', payload)
    Ο AdminSocketProvider λαμβάνει το payload,
    ενημερώνει state (lastDelivery)
    και έτσι ενεργοποιείται το global admin alert.
    */
    socket.on("transaction:created", (payload: TxCreatedPayload) => {
      if (payload.sessionId?.startsWith("COD_")) {
        console.log("🚚 New COD delivery (GLOBAL):", payload);
        setLastDelivery(payload);
      }
    });

    return () => {
      console.log("🔴 AdminSocketProvider UNMOUNT");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  // pop dialog btns λογική κάνουν axios σε backend endpoints
  const approve = async () => {
    if (!lastDelivery) return;
    const token = localStorage.getItem("token");

    await axios.post(
      `${url}/api/transaction/confirm/${lastDelivery.transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setLastDelivery(null);
  };

  const cancel = async () => {
    if (!lastDelivery) return;
    const token = localStorage.getItem("token");

    await axios.post(
      `${url}/api/transaction/cancel/${lastDelivery.transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setLastDelivery(null);
  };

  return (
    // Για ΟΛΑ τα components που είναι παιδιά μου, όταν ζητήσουν AdminSocketContext,δώσε τους αυτό το value
    <AdminSocketContext.Provider
      value={{
        lastDelivery,
        clearLastDelivery: () => setLastDelivery(null),
      }}
    >
      {children}

      {/* 🔔 GLOBAL ADMIN DELIVERY ALERT */}
      <AdminDeliveryAlert
        open={!!lastDelivery}
        onApprove={approve}
        onCancel={cancel}
        onClose={() => setLastDelivery(null)}
      />
    </AdminSocketContext.Provider>
  );
};

export default AdminSocketProvider;
