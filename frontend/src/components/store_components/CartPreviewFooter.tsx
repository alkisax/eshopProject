import { useContext } from "react";
import { Box, IconButton, Typography, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CartType } from "../../types/commerce.types";
import { CartActionsContext } from "../../context/CartActionsContext";
import { VariablesContext } from "../../context/VariablesContext";

interface Props {
  hasCart: boolean;
  cart: CartType | null;
  fetchCart: () => Promise<void>;
}

const CartPreviewFooter = ({ hasCart, cart, fetchCart }: Props) => {
  const { addQuantityCommodityToCart, removeItemFromCart, fetchParticipantId } =
    useContext(CartActionsContext);
  const { globalParticipant } = useContext(VariablesContext);

  if (!hasCart || !cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        borderTop: "1px solid #ddd",
        background: "#fafafa",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Cart
      </Typography>
      {cart.items.map((item) => (
        <Box
          key={item.commodity._id.toString()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography sx={{ flexGrow: 1 }}>
            {item.commodity.name} ({item.priceAtPurchase}€)
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* - button */}
            <IconButton
              size="small"
              onClick={async () => {
                const pid = await fetchParticipantId();
                if (pid) {
                  await addQuantityCommodityToCart(
                    pid,
                    item.commodity._id.toString(),
                    -1
                  );
                  await fetchCart();
                }
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            {/* qty */}
            <Typography>{item.quantity}</Typography>

            {/* + button */}
            <IconButton
              size="small"
              onClick={async () => {
                const pid = await fetchParticipantId();
                if (pid) {
                  await addQuantityCommodityToCart(
                    pid,
                    item.commodity._id.toString(),
                    1
                  );
                  await fetchCart();
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>

            {/* delete all */}
            <IconButton
              size="small"
              onClick={async () => {
                const pid = globalParticipant?._id?.toString();
                if (pid) {
                  await removeItemFromCart(pid, item.commodity._id.toString());
                  await fetchCart();
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Divider sx={{ my: 1 }} />
      <Typography>
        <strong>Total:</strong>{" "}
        {cart.items.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0
        )}{" "}
        €
      </Typography>
    </Box>
  );
};

export default CartPreviewFooter;
