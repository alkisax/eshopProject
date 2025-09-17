

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

import { Box, Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { CartActionsContext } from "../../context/CartActionsContext";


const CartItemsList = () => {
  const { addOneToCart, addQuantityCommodityToCart, removeItemFromCart, fetchParticipantId } =
  useContext(CartActionsContext)!;
  const { url, globalParticipant } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);
  const [cart, setCart] = useState<CartType>()

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

  const add = async (id: string): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addOneToCart(id);
    await fetchCart();   // 👈 refresh
  };

  const decrement = async (id: string): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addQuantityCommodityToCart(participantId, id, -1);
    await fetchCart();   // 👈 refresh
  };

  const remove = async (id: string): Promise<void> => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await removeItemFromCart(participantId, id);
    await fetchCart();   // 👈 refresh
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Cart Items
      </Typography>

      {isLoading ? (
        <Loading />
      ) : !cart ? (
        <p>No cart found.</p>
      ) : cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <List>
          {cart.items.map((item) => (
            <ListItem
              key={item.commodity._id.toString()}
              sx={{
                bgcolor: "#fafafa",
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                minHeight: 120, // 👈 double height
                alignItems: "center",
              }}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="medium" // 👈 bigger buttons
                    color="primary"
                    onClick={(e) => {
                      e.preventDefault();
                      add(item.commodity._id);
                    }}
                  >
                    <AddIcon />
                  </IconButton>

                  <IconButton
                    size="medium"
                    color="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      decrement(item.commodity._id);
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <IconButton
                    size="medium"
                    color="error"
                    onClick={(e) => {
                      e.preventDefault();
                      remove(item.commodity._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemButton
                component={Link}
                to={`/commodity/${item.commodity._id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  py: 2,
                }}
              >
                <Box
                  component="img"
                  src={item.commodity.images?.[0] || "/placeholder.jpg"}
                  alt={item.commodity.name}
                  sx={{
                    width: 100, 
                    height: 100,
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
                  secondary={`${item.commodity.price} ${item.commodity.currency} — Qty: ${item.quantity}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
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
  )
}
export default CartItemsList