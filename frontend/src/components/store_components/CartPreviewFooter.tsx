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
   * 🧱 Defensive guard
   * Αν:
   * - δεν υπάρχει cart
   * - ή είναι άδειο
   * - ή items δεν είναι array
   * → δεν αποδίδουμε τίποτα
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
   * 🧹 Καθαρίζουμε corrupted items
   * (π.χ. race condition backend / CI / partial populate)
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
        const variantId = item.variantId ?? null;

        /**
         * 🔍 Αν υπάρχει variantId
         * βρίσκουμε το αντίστοιχο variant
         * για να εμφανίσουμε attributes (π.χ. size / color)
         */
        const selectedVariant =
          variantId && item.commodity.variants
            ? item.commodity.variants.find(
                (v) => v._id?.toString() === variantId
              )
            : null;

        return (
          <Box
            /**
             * 🔑 key
             * ΠΡΕΠΕΙ να διαχωρίζει:
             * - ίδιο προϊόν
             * - διαφορετικά variants
             */
            key={`${commodityId}-${variantId ?? "novariant"}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            {/* 🧾 Όνομα προϊόντος + variant (αν υπάρχει) */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight="bold">
                {item.commodity.name}
              </Typography>

              {selectedVariant && (
                <Typography variant="body2" color="text.secondary">
                  {Object.entries(selectedVariant.attributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" / ")}
                </Typography>
              )}

              <Typography variant="body2">
                {item.priceAtPurchase}€ × {item.quantity}
              </Typography>
            </Box>

            {/* 🔘 Κουμπιά ποσότητας / διαγραφής */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* ➖ μείωση ποσότητας */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = await fetchParticipantId();
                  if (!participantId) return;

                  await addQuantityCommodityToCart(
                    participantId,
                    commodityId,
                    -1,
                    variantId // ⬅️ περνάμε variant
                  );

                  await fetchCart();
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              {/* ποσότητα */}
              <Typography>{item.quantity}</Typography>

              {/* ➕ αύξηση ποσότητας */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = await fetchParticipantId();
                  if (!participantId) return;

                  await addQuantityCommodityToCart(
                    participantId,
                    commodityId,
                    1,
                    variantId // ⬅️ περνάμε variant
                  );

                  await fetchCart();
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>

              {/* 🗑️ διαγραφή ΟΛΟΥ του συγκεκριμένου variant */}
              <IconButton
                size="small"
                onClick={async () => {
                  const participantId = globalParticipant?._id?.toString();
                  if (!participantId) return;

                  await removeItemFromCart(
                    participantId,
                    commodityId,
                    variantId // ⬅️ κρίσιμο
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

      {/* 💰 Σύνολο καλαθιού
          Υπολογίζεται από priceAtPurchase × quantity
          (σωστό ακόμα και αν αλλάξει τιμή προϊόντος)
      */}
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
