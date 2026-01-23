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
  const socketRef = useRef<Socket | null>(null);

  const [lastDelivery, setLastDelivery] = useState<TxCreatedPayload | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("🟢 AdminSocketProvider MOUNT");

    const socket = io(url, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Admin socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Admin socket error:", err.message);
    });

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
