// frontend\src\components\store_components\adminPannelCommodity\AdminTransactionPanelComponents\UserTransactionsList.tsx
import { Stack, Paper, Typography, Divider, Box } from "@mui/material";
import { Link } from "react-router-dom";
import type { TransactionType, CartItemType } from "../../../../types/commerce.types";

interface Props {
  orders: TransactionType[];
  showTransactionId?: boolean;
}

const getVariantLabel = (item: CartItemType): string | null => {
  if (!item.variantId || !item.commodity?.variants) return null;

  const variant = item.commodity.variants.find(
    (v) => (v._id?.toString?.() ?? v._id) === item.variantId
  );

  if (!variant?.attributes) return null;

  return Object.entries(variant.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
};

const UserTransactionsList = ({ orders, showTransactionId }: Props) => {
  if (orders.length === 0) {
    return <Typography>No orders found.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {orders.map((order, idx) => (
        <Paper key={idx} sx={{ p: 2 }} variant="outlined">
          {showTransactionId && (
            <Typography variant="caption" color="text.secondary">
              ID: {order._id}
            </Typography>
          )}

          <Typography variant="body2" fontWeight="bold">
            {new Date(order.createdAt!).toLocaleString()}
          </Typography>

          <Typography variant="body2">
            Status: {order.status} | Processed: {String(order.processed)}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {order.items.map((item, i) => {
            const variantLabel = getVariantLabel(item);
            return (
              <Box
                key={i}
                component={Link}
                to={`/commodity/${item.commodity?._id}`}
                sx={{
                  display: "block",
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {item.commodity?.name} × {item.quantity} —{" "}
                {item.priceAtPurchase}€
                {variantLabel && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Variant: {variantLabel}
                  </Typography>
                )}
              </Box>
            );
          })}

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2">
            <strong>Total:</strong> {order.amount} €
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

export default UserTransactionsList;
