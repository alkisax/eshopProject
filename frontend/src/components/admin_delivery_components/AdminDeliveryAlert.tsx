// frontend\src\components\admin_delivery_components\AdminDeliveryAlert.tsx
import { Dialog, Box, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AdminDeliveryAlert = ({ open, onClose }: Props) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Audio είναι browser API που αναπαριστά έναν media player ήχου (χωρίς UI), σου επιτρέπει να φορτώνεις, παίζεις, παύεις και ελέγχεις ήχο μέσω JS.
    // κάνουμε instansiate ενα object της κλάσης Audio
    const sound = new Audio("/sounds/notification-for-orders-313025.mp3");
    sound.loop = true;
    sound.volume = 0.8;
    // επιστρέφει promise και για αυτό βάζουμε και το .catch
    sound.play().catch(() => console.warn("🔇 Autoplay blocked"));

    setAudio(sound);

    // Το return μέσα στο useEffect ΔΕΝ εκτελείται αμέσως. Εκτελείται: πριν ξανατρέξει το effect (cleanup προηγούμενου run), όταν το component κάνει unmount
    return () => {
      sound.pause();
      sound.currentTime = 0;
      setAudio(null);
    };
  }, [open]);

  const handleClose = () => {
    audio?.pause();
    if (audio) {
      audio.currentTime = 0;
    }
    setAudio(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            p: 4,
            textAlign: "center",
          },
        },
      }}
    >
      <Box>
        <Typography variant="h3" gutterBottom>
          🚚 Νέα Παραγγελία Delivery
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Υπάρχει νέα παραγγελία.
        </Typography>

        <Button
          variant="contained"
          size="large"
          color="success"
          onClick={handleClose}
        >
          ✅ done
        </Button>
      </Box>
    </Dialog>
  );
};

export default AdminDeliveryAlert;
