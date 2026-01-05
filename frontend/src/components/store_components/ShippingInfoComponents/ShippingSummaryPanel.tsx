// components/store_components/ShippingInfoComponents/ShippingSummaryPanel.tsx
import {
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import ShippingInfoCart from "./ShippingInfoCart";
import type { CartType } from "../../../types/commerce.types";

type Props = {
  cart: CartType;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod: string;
  onChange: (value: string) => void;
};

const ShippingSummaryPanel = ({
  cart,
  subtotal,
  shippingCost,
  total,
  shippingMethod,
  onChange,
}: Props) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3, // 🔑 prevents overlap
      }}
    >
      <ShippingInfoCart
        cart={cart}
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
      />

      <Typography variant="h6">Τρόπος Αποστολής</Typography>

      <RadioGroup
        value={shippingMethod}
        onChange={(e) => onChange(e.target.value)}
      >
        <FormControlLabel
          id="shipping-courier-option"
          value="courier"
          control={<Radio />}
          label="Αποστολή με Courier: 3,25 €"
        />

        <FormControlLabel
          id="shipping-boxnow-option"
          value="boxnow"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body1">
                BOX NOW Lockers | 24/7: 3,25 €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Προσωρινή αποστολή στο κοντινότερο locker
              </Typography>
            </Box>
          }
        />

        <FormControlLabel
          id="shipping-pickup-option"
          value="pickup"
          control={<Radio />}
          label="Παραλαβή από το κατάστημα: 0 €"
        />
      </RadioGroup>
    </Paper>
  );
};

export default ShippingSummaryPanel;
