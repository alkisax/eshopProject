// frontend\src\components\admin_delivery_components\AdminDeliverySocketListener.tsx
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AdminDeliveryAlert from "./AdminDeliveryAlert";

type Props = {
  onNewDelivery: () => void;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const AdminDeliverySocketListener = ({ onNewDelivery }: Props) => {
  const [alertOpen, setAlertOpen] = useState(false);

  // ✅ ΚΡΑΤΑΜΕ reference στο callback ΧΩΡΙΣ να σπάμε το socket
  const onNewDeliveryRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onNewDeliveryRef.current = onNewDelivery;
  }, [onNewDelivery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🧪 Admin socket init, token:", token);
    if (!token) return;

    console.log("🌍 SOCKET CONNECT TO:", backendUrl);
    const socket: Socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connect_error:", err.message);
    });

    socket.on("transaction:created", (payload) => {
      if (payload.sessionId?.startsWith("COD_")) {
        console.log("🚚 New COD delivery order:", payload);

        setAlertOpen(true);

        // ✅ καλούμε το ref, ΟΧΙ prop
        onNewDeliveryRef.current?.();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // ❗ ΚΕΝΟ — ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ

  return (
    <AdminDeliveryAlert open={alertOpen} onClose={() => setAlertOpen(false)} />
  );
};

export default AdminDeliverySocketListener;
