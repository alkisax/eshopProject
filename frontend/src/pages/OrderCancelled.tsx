import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OrderCancelled = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: 4,
          maxWidth: 520,
          textAlign: "center",
          borderRadius: 3,
          backgroundColor: "rgba(244, 67, 54, 0.05)",
        }}
      >
        <Typography variant="h4" gutterBottom color="error">
          ❌ Η παραγγελία ακυρώθηκε
        </Typography>

        <Typography sx={{ mb: 2 }} color="text.secondary">
          Η παραγγελία σας δεν εγκρίθηκε από το κατάστημα και ακυρώθηκε.
        </Typography>

        <Typography sx={{ mb: 4 }} color="text.secondary">
          Δεν χρειάζεται να κάνετε κάποια ενέργεια.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Επιστροφή στο κατάστημα
        </Button>
      </Paper>
    </Box>
  );
};

export default OrderCancelled;
