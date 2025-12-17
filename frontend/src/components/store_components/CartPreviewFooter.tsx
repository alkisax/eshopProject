// frontend\src\components\store_components\CartPreviewFooter.tsx
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
  const {
    addQuantityCommodityToCart,
    removeItemFromCart,
    fetchParticipantId,
  } = useContext(CartActionsContext);

  const { globalParticipant } = useContext(VariablesContext);

  /**
   * 🧱 Defensive check
   * - Αν δεν υπάρχει cart ή είναι άδειο → δεν δείχνουμε footer
   */
  if (
    !hasCart ||
    !cart ||
    !Array.isArray(cart.items) ||
    cart.items.length === 0
  ) {
    return null;
  }

  /**
   * 🧩 Φιλτράρουμε corrupted items
   * (π.χ. σε CI / race conditions backend)
   */
  const safeItems = cart.items.filter(
    (item) => item && item.commodity && item.commodity._id
  );

  return (
    <Box
      id="cart-preview-footer"
      sx={{
        borderTop: "1px solid #ddd",
        background: "#fafafa",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Cart
      </Typography>

      {safeItems.map((item) => {
        const commodityId = item.commodity._id.toString();
        const variantId = item.variantId; // 🆕 ΚΡΙΣΙΜΟ

        return (
          <Box
            /**
             * 🔑 key ΠΡΕΠΕΙ να διαχωρίζει variants
             */
            key={`${commodityId}-${variantId ?? "novar"}`}
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
              {/* ➖ Μείωση ποσότητας */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = await fetchParticipantId();
                  if (!participantId) return;

                  await addQuantityCommodityToCart(
                    participantId,
                    commodityId,
                    -1,
                    variantId // ⬅️ ΠΕΡΝΑΜΕ VARIANT
                  );

                  await fetchCart();
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              {/* ποσότητα */}
              <Typography>{item.quantity}</Typography>

              {/* ➕ Αύξηση ποσότητας */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = await fetchParticipantId();
                  if (!participantId) return;

                  await addQuantityCommodityToCart(
                    participantId,
                    commodityId,
                    1,
                    variantId // ⬅️ ΠΕΡΝΑΜΕ VARIANT
                  );

                  await fetchCart();
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>

              {/* 🗑️ Διαγραφή όλου του item (συγκεκριμένου variant) */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = globalParticipant?._id?.toString();
                  if (!participantId) return;

                  await removeItemFromCart(
                    participantId,
                    commodityId,
                    variantId // ⬅️ ΠΕΡΝΑΜΕ VARIANT
                  );

                  await fetchCart();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      })}

      <Divider sx={{ my: 1 }} />

      {/* 💰 Σύνολο */}
      <Typography>
        <strong>Total:</strong>{" "}
        {safeItems.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0
        )}{" "}
        €
      </Typography>
    </Box>
  );
};

export default CartPreviewFooter;

