// frontend\src\components\admin_delivery_components\AdminDeliverySocketListener.tsx
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AdminDeliveryAlert from "./AdminDeliveryAlert";
import { VariablesContext } from "../../context/VariablesContext";
import axios from "axios";

type Props = {
  onNewDelivery: () => void;
};

type TxCreatedPayload = {
  transactionId: string;
  status: string;
  sessionId: string;
  createdAt: string;
};

const AdminDeliverySocketListener = ({ onNewDelivery }: Props) => {
  const { url } = useContext(VariablesContext);
  const [alertOpen, setAlertOpen] = useState(false);
  const [pending, setPending] = useState<TxCreatedPayload | null>(null);

  // ✅ ΚΡΑΤΑΜΕ reference στο callback ΧΩΡΙΣ να σπάμε το socket
  const onNewDeliveryRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onNewDeliveryRef.current = onNewDelivery;
  }, [onNewDelivery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🧪 Admin socket init, token:", token);
    if (!token) return;

    console.log("🌍 SOCKET CONNECT TO:", url);
    const socket: Socket = io(url, {
      auth: { token },
      transports: ["websocket"],
    });

    // logs
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connect_error:", err.message);
    });

    socket.on("transaction:created", (payload) => {
      if (payload.sessionId?.startsWith("COD_")) {
        console.log("🚚 New COD delivery order:", payload);

        setPending(payload);
        setAlertOpen(true);

        // ✅ καλούμε το ref, ΟΧΙ prop
        onNewDeliveryRef.current?.();
      }
    });

    return () => {
      socket.off("transaction:created");
      socket.disconnect();
    };
  }, [url]);

  const closeAlert = () => {
    setAlertOpen(false);
    setPending(null);
  };

  const approve = useCallback(async () => {
    if (!pending) return;
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/confirm/${pending.transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    onNewDelivery(); // refresh list
  }, [pending, url, onNewDelivery]);

  const cancel = useCallback(async () => {
    if (!pending) return;
    const token = localStorage.getItem("token");
    await axios.post(
      `${url}/api/transaction/cancel/${pending.transactionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    onNewDelivery(); // refresh list
  }, [pending, url, onNewDelivery]);

  return (
    <AdminDeliveryAlert
      open={alertOpen}
      onClose={closeAlert}
      onApprove={approve}
      onCancel={cancel}
    />
  );
};

export default AdminDeliverySocketListener;
