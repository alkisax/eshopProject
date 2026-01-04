// frontend\src\components\store_components\ShippingInfoComponents\ShippingInfoCart.tsx
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type { CartType } from "../../../types/commerce.types";

type Props = {
  cart: CartType;
  subtotal: number;
  shippingCost: number;
  total: number;
};

const ShippingInfoCart = ({ cart, subtotal, shippingCost, total }: Props) => {
  return (
    <Paper sx={{ p: 2, top: 80 }}>
      <Typography variant='h6'>Σύνοψη Παραγγελίας</Typography>

      <List dense>
        {cart.items.map(item => (
          <ListItem key={item.commodity._id}>
            <ListItemText
              primary={`${item.commodity.name} × ${item.quantity}`}
              secondary={`${item.commodity.price}€`}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Typography>Υποσύνολο: {subtotal.toFixed(2)}€</Typography>
      <Typography>Μεταφορικά: {shippingCost.toFixed(2)}€</Typography>

      <Divider sx={{ my: 1 }} />

      <Typography variant='h6'>
        Σύνολο: {total.toFixed(2)}€
      </Typography>
    </Paper>
  );
};

export default ShippingInfoCart;
