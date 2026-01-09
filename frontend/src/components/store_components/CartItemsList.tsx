// frontend\src\components\store_components\CartItemsList.tsx

import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";
import { useCallback, useContext, useEffect, useState } from "react";
import { VariablesContext } from "../../context/VariablesContext";
import type { CartType } from "../../types/commerce.types";
// removed for passing first through sipping info
// import { useCheckout } from "../../hooks/useCheckout";

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { CartActionsContext } from "../../context/CartActionsContext";

const CartItemsList = () => {
  const {
    addOneToCart,
    addQuantityCommodityToCart,
    removeItemFromCart,
    fetchParticipantId,
  } = useContext(CartActionsContext)!;
  const { url, globalParticipant } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);
  const [cart, setCart] = useState<CartType>();

  // removed for passing first through sipping info
  // const { handleCheckout } = useCheckout();

  const navigate = useNavigate();

  // 📝 Χρησιμοποιούμε useCallback για να "κλειδώσουμε" τη συνάρτηση fetchCart,// ώστε να μη δημιουργείται καινούρια σε κάθε render. Έτσι δεν τρελαίνεται το useEffect και αποφεύγουμε το άπειρο loop / warning για dependencies στο [] του useeffect.
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/api/cart/${globalParticipant?._id}`);
      const cartRes: CartType = res.data.data;
      setCart(cartRes);
      console.log("fetched cart is: ", cartRes);
    } catch {
      console.log("error fetching cart");
    } finally {
      setIsLoading(false);
    }
  }, [url, globalParticipant?._id, setIsLoading]);

  useEffect(() => {
    if (globalParticipant?._id) {
      fetchCart();
    }
  }, [fetchCart, globalParticipant?._id, setIsLoading, url]);

  const add = async (
    commodityId: string,
    variantId?: string
  ): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addOneToCart(commodityId, variantId);
    await fetchCart(); // 👈 refresh
  };

  const decrement = async (
    commodityId: string,
    variantId?: string
  ): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addQuantityCommodityToCart(participantId, commodityId, -1, variantId);
    await fetchCart(); // 👈 refresh
  };

  const remove = async (
    commodityId: string,
    variantId?: string
  ): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await removeItemFromCart(participantId, commodityId, variantId);
    await fetchCart(); // 👈 refresh
  };

  return (
    <>
      <Typography component="h2" variant="h4" gutterBottom>
        Τα προϊόντα σας
      </Typography>

      {isLoading ? (
        <Loading />
      ) : !cart ? (
        <p>No cart found.</p>
      ) : cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <List>
          {cart.items.map((item) => {
            // 🔍 βρίσκουμε το επιλεγμένο variant (αν υπάρχει)
            const selectedVariant = item.variantId
              ? item.commodity.variants?.find(
                  (v) => v._id?.toString() === item.variantId
                )
              : null;

            return (
              <ListItem
                key={`${item.commodity._id}-${item.variantId ?? "no-variant"}`}
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  bgcolor: "#fafafa",
                  gap: 2,
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  p: 2,
                }}
              >
                {/* Image + text */}
                <ListItemButton
                  component={Link}
                  to={`/commodity/${item.commodity._id}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    component="img"
                    src={item.commodity.images?.[0] || "/placeholder.jpg"}
                    alt={item.commodity.name}
                    loading="lazy"
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #ddd",
                    }}
                  />

                  <ListItemText
                    slotProps={{
                      primary: {
                        sx: { fontWeight: "bold", fontSize: "1.1rem" },
                      },
                      secondary: {
                        sx: { fontSize: "0.95rem", color: "text.secondary" },
                      },
                    }}
                    primary={item.commodity.name}
                    secondary={
                      <>
                        {/* 🧩 Εμφάνιση variant αν υπάρχει */}
                        {selectedVariant && (
                          <Typography component="span" display="block">
                            {Object.entries(selectedVariant.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" / ")}
                          </Typography>
                        )}

                        {/* 💰 Τιμή + ποσότητα */}
                        <Typography component="span" display="block">
                          {item.commodity.price} {item.commodity.currency} per item —
                          Qty: {item.quantity}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>

                {/* Buttons */}
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="primary"
                    onClick={() => add(item.commodity._id, item.variantId)}
                  >
                    <AddIcon />
                  </IconButton>

                  {/* Qty display */}
                  <Typography
                    variant="body1"
                    sx={{
                      minWidth: 24,
                      textAlign: "center",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.quantity}
                  </Typography>

                  <IconButton
                    color="secondary"
                    onClick={() =>
                      decrement(item.commodity._id, item.variantId)
                    }
                  >
                    <RemoveIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => remove(item.commodity._id, item.variantId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      )}

      {cart && cart.items.length > 0 && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          <strong>Total:</strong>{" "}
          {cart.items.reduce(
            (sum, item) => sum + item.commodity.price * item.quantity,
            0
          )}{" "}
          {cart.items[0]?.commodity.currency || ""}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          id="proceed-to-shipping-btn"
          variant="contained"
          color="primary"
          onClick={() => navigate("/shipping-info")}
        >
          Proceed to shipping info
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/store")}
        >
          Continue Shopping
        </Button>
      </Stack>
    </>
  );
};
export default CartItemsList;
