// frontend\src\components\store_components\ShippingInfoComponents\IrisDialog.tsx
import { useSettings } from "../../../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useIrisCheckout } from "../../../hooks/useIrisCheckout";
import type { ShippingInfoType } from "../../../types/commerce.types";

type IrisDialogProps = {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  shippingInfo: ShippingInfoType;
};

const IrisDialog = ({
  open,
  onClose,
  totalAmount,
  shippingInfo,
}: IrisDialogProps) => {
  const { settings } = useSettings();
  const supportEmail = settings?.companyInfo?.email;
  const { handleIrisCheckout } = useIrisCheckout();

  const navigate = useNavigate();
  const irisBankQR = settings?.companyInfo?.irisBankQR;

  const handleIrisComplete = async () => {
    try {
      await handleIrisCheckout(shippingInfo);
      onClose();
      navigate("/checkout-success");
    } catch (err) {
      console.error("IRIS checkout failed", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Πληρωμή με IRIS</DialogTitle>

      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Σκανάρετε το QR ή πληρώστε μέσω IRIS με το παρακάτω ποσό.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Ολοκληρώστε την τραπεζική συναλλαγή μέσω της τράπεζάς σας και στείλτε
          την απόδειξη στο <strong>{supportEmail}</strong>.
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Στην αιτιολογία παρακαλούμε αναγράψτε το ονοματεπώνυμό σας.
        </Typography>

        {/* Στατικό QR απο public */}
        {/* <Box
          component="img"
          src="/bank/IrisBankQR.png"
          alt="IRIS Bank QR"
          sx={{
            width: "100%",
            maxWidth: 220,
            display: "block",
            mx: "auto",
            my: 2,
          }}
        /> */}

        {irisBankQR && (
          <Box
            component="img"
            src={irisBankQR}
            alt="IRIS Bank QR"
            sx={{
              width: "100%",
              maxWidth: 220,
              display: "block",
              mx: "auto",
              my: 2,
            }}
          />
        )}

        <Typography variant="h4" align="center">
          Σύνολο: <strong>{totalAmount.toFixed(2)} €</strong>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          Η παραγγελία θα εκτελεστεί αφού επιβεβαιωθεί η πληρωμή.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Ακύρωση
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleIrisComplete}
        >
          Ολοκλήρωση αγοράς
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IrisDialog;
