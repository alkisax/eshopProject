

import axios from "axios";
import { UserAuthContext } from "../../context/UserAuthContext";
import Loading from "../Loading";
import { useContext, useEffect, useState } from "react";
import { VariablesContext } from "../../context/VariablesContext";
import type { CartType } from "../../types/commerce.types";
import { useCheckout } from "../../hooks/useCheckout";

import { Button } from "@mui/material";

const CartItemsList = () => {
  const { url, globalParticipant } = useContext(VariablesContext);
  const { setIsLoading, isLoading } = useContext(UserAuthContext);
  const [cart, setCart] = useState<CartType>()

  const { handleCheckout } = useCheckout();


  useEffect(() => {
    const fetchCart= async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${url}/api/cart/${globalParticipant?._id}`, {
        });
        const cartRes: CartType = res.data.data
        setCart(cartRes)
        console.log('fetched cart is: ', cartRes);
      } catch {
        console.log("error fetching cart");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, [globalParticipant?._id, setIsLoading, url]);

  return (
    <>
      <h2>Commodity List</h2>
      {/* a turnary inside a turnary */}
      {isLoading ? (
        <Loading />
      ) : !cart ? (
        <p>No cart found.</p>
      ) : cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.items.map((item, idx) => (
            <li key={idx}>
              <strong>{item.commodity.name}</strong> — {item.commodity.price} {item.commodity.currency}
              <span style={{ marginLeft: "1rem" }}>Qty: {item.quantity}</span>
            </li>
          ))}
        </ul>
        
      )}

      {cart && 
        <p>
          <strong>Total:</strong>{" "}
          {cart.items.reduce(
            (sum, item) => sum + item.commodity.price * item.quantity,
            0
          )}{" "}
          {cart.items[0]?.commodity.currency || ""}
        </p>
      }

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => {handleCheckout()}}
      >
        Proceed to Checkout
      </Button>
    </>
  )
}
export default CartItemsList