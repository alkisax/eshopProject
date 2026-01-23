// frontend\src\components\admin_delivery_components\AdminDeliveryAlert.tsx
import {
  Dialog,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onApprove: () => Promise<void>;
  onCancel: () => Promise<void>;
  onClose: () => void;
};

const AdminDeliveryAlert = ({ open, onApprove, onCancel, onClose }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [busy, setBusy] = useState<"approve" | "cancel" | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Audio είναι browser API που αναπαριστά έναν media player ήχου (χωρίς UI), σου επιτρέπει να φορτώνεις, παίζεις, παύεις και ελέγχεις ήχο μέσω JS.
    // κάνουμε instansiate ενα object της κλάσης Audio
    const sound = new Audio("/sounds/notification-for-orders-313025.mp3");
    sound.loop = true;
    sound.volume = 0.8;
    // επιστρέφει promise και για αυτό βάζουμε και το .catch
    sound
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => {
        console.warn("🔇 Autoplay blocked");
        setAutoplayBlocked(true);
      });

    audioRef.current = sound;

    // Το return μέσα στο useEffect ΔΕΝ εκτελείται αμέσως. Εκτελείται: πριν ξανατρέξει το effect (cleanup προηγούμενου run), όταν το component κάνει unmount
    return () => {
      sound.pause();
      sound.currentTime = 0;
      audioRef.current = null;
    };
  }, [open]);

  const stopSoundAndClose = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    onClose();
  };

  const handleApproveClick = async () => {
    try {
      setBusy("approve");
      await onApprove();
      stopSoundAndClose();
    } finally {
      setBusy(null);
    }
  };

  const handleCancelClick = async () => {
    try {
      setBusy("cancel");
      await onCancel();
      stopSoundAndClose();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
      onClose={(_e, reason) => {
        // δεν θέλουμε να κλείνει από backdrop click / escape
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
      }}
      slotProps={{
        paper: {
          sx: {
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            borderRadius: 4,
          },
        },
      }}
    >
      <Box>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
          🚚 Νέα Παραγγελία Delivery
        </Typography>

        <Typography variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
          Υπάρχει νέα παραγγελία COD και περιμένει έγκριση.
        </Typography>

        {autoplayBlocked && (
          <Typography variant="body2" sx={{ mb: 3 }}>
            🔇 Ο browser μπλόκαρε autoplay ήχου. Κάνε ένα click οπουδήποτε στο
            site και στο επόμενο alert θα παίζει κανονικά.
          </Typography>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            color="success"
            onClick={handleApproveClick}
            disabled={!!busy}
            sx={{ minWidth: 220, py: 1.5, fontSize: "1.05rem" }}
          >
            {busy === "approve" ? <CircularProgress size={22} /> : "✅ Approve"}
          </Button>

          <Button
            variant="contained"
            size="large"
            color="error"
            onClick={handleCancelClick}
            disabled={!!busy}
            sx={{ minWidth: 220, py: 1.5, fontSize: "1.05rem" }}
          >
            {busy === "cancel" ? <CircularProgress size={22} /> : "⛔ Cancel"}
          </Button>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Button variant="text" color="inherit" onClick={stopSoundAndClose}>
            Close (χωρίς action)
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AdminDeliveryAlert;
