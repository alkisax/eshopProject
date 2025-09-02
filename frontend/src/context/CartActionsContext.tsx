import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import type { ParticipantType, CartType } from "../types/commerce.types";
import { VariablesContext } from "./VariablesContext"; // ✅ because you’re using setGlobalParticipant
import { UserAuthContext } from "./UserAuthContext";

interface CartActionsContextType {
  addOneToCart: (commodityId: string) => Promise<void>;
  removeItemFromCart : (
    participantId: string,
    commodityId: string,
  ) => Promise<void>;
  addQuantityCommodityToCart: (
    participantId: string,
    commodityId: string,
    quantity: number
  ) => Promise<void>;
  fetchParticipantId: () => Promise<string | null>;
  loadingItemId: string | null;
  hasCart: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartActionsContext = createContext<CartActionsContextType>({
  addOneToCart: async () => { throw new Error("addOneToCart not implemented"); },
  removeItemFromCart: async () => { throw new Error("removeItemFromCart not implemented"); },
  addQuantityCommodityToCart: async () => { throw new Error("addQuantityCommodityToCart not implemented"); },
  fetchParticipantId: async () => null,
  loadingItemId: null,
  hasCart: false,
});


export const CartActionsProvider = ({ children }: { children: ReactNode }) => {
  const { setGlobalParticipant, url, hasCart, setHasCart} = useContext(VariablesContext);
  const { user } = useContext(UserAuthContext);

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // part 1/2
  const fetchParticipantId = async (): Promise<string | null> => {
    console.log("enter addToCart");

    if (user) {
      // 1. get user from context
      console.log("setp 1. See if user has participant. user from context: ", user);
      const email = user?.email;
      if (!email) {
        console.error("email is required");
        return null;
      }

      // 2. see if user is assosiated with a participant
      try {
        const response = await axios.get<{ status: boolean; data: ParticipantType }>(
          `${url}/api/participant/by-email?email=${email}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const found = response.data.data;
        setGlobalParticipant(found);
        return found._id  ?? null;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.log("No participant found, will create a new one...");
        } else {
          throw err;
        }
      }

      // 3. if user without participant, create participant and add it to user
      console.log("step 3. User has not participant association");

      const newParticipantData = {
        name: user?.name,
        surname: user?.surname,
        email: user?.email,
        user: user?._id,
        transactions: [],
      };

      const response = await axios.post<{ status: boolean; data: ParticipantType }>(
        `${url}/api/participant/`,
        newParticipantData
      );
      if (!response) {
        console.error("error creating participant");
        return null;
      }

      const newParticipant = response.data.data;
      setGlobalParticipant(newParticipant);

      console.log(
        `step 3. User is associeted with a new participant. id: ${newParticipant._id}`
      );
      return newParticipant._id  ?? null;
    } else {
      // 4. if no user create a participant
      console.log("step 4. no existing user. we will create a participant not associated with a user");

      // 4a. check if guest has lockalstorage
      const storedParticipantId = localStorage.getItem("guestParticipantId");
      if (storedParticipantId) {
        // 4b. if yes refetch his cart
        try {
          const response = await axios.get<{ status: boolean; data: ParticipantType }>(
            `${url}/api/participant/${storedParticipantId}`
          );
          const newParticipant = response.data.data;
          setGlobalParticipant(newParticipant);
          console.log("Guest restored from localStorage:", response.data.data);
          return newParticipant._id  ?? null;
        } catch (err: unknown) {
          console.warn("Stored guest not found in DB, creating a new one...", err);
          localStorage.removeItem("guestParticipantId");
        }
      } else {
        // 4c. if no create a sth to lockal storage.
        const uuidGuest = uuidv4();
        const guestEmail = `guest-${uuidGuest}@eshop.local`;

        const newParticipantData = {
          name: "",
          surname: "",
          email: guestEmail,
          user: "",
          transactions: [],
        };

        const response = await axios.post<{ status: boolean; data: ParticipantType }>(
          `${url}/api/participant/`,
          newParticipantData
        );

        const newParticipant = response.data.data;
        setGlobalParticipant(newParticipant);

        // 🔑 Store the participant id for later refresh
        // added "trust me" at _id with '!'
        localStorage.setItem("guestParticipantId", newParticipant._id!.toString());

        console.log(
          `step 4. Guest is associeted with a new participant. id: ${newParticipant._id} and email: ${newParticipant.email}`
        );
        return newParticipant._id ?? null;
      }
    }
    return null;
  };

  // part 2/2
  const addQuantityCommodityToCart = async (
    participantId: string,
    commodityId: string,
    quantity: number
  ): Promise<void> => {
    console.log("Creating cart for participantId:", participantId);
    try {
      // 5. check if participant has a cart if no create one
      // creation is automated if not existing by cart dao
      const cartRes = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}`
      );
      const ensuredCart = cartRes.data.data;
      console.log("ensured cart: ", ensuredCart);

      // 6. add commodity to cart
      const data = {
        commodityId,
        quantity,
      };

      // note: ?participantId=${participantId}
      await axios.patch<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}/items`,
        data
      );
      console.log(`item id:${commodityId}, quantity: ${quantity} reached cart`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error adding commodity to cart:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  const addOneToCart = async (commodityId: string): Promise<void> => {
    try {
      const participantId = await fetchParticipantId();
      if (!participantId) {
        console.error("No participantId available, cannot add to cart");
        return;
      }

      await addQuantityCommodityToCart(participantId, commodityId, 1);
      setHasCart(true); // optimistic update
      setLoadingItemId(commodityId); //axios spamming controll

      // this part is just for logging the cart maybe later remove
      const cartRes = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}`
      );

      const cart = cartRes.data.data;
      setHasCart(cart.items.length > 0); // actual backend truth update
      console.log(`cart items:`, cart.items);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error adding commodity to cart:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const removeItemFromCart = async (
    participantId: string,
    commodityId: string
  ): Promise<void> => {
    try {
      await axios.patch<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}/items`,
        {
          commodityId,
          quantity: -99999, // TODO ugly
        }
      );
      console.log(`Removed commodity ${commodityId} completely from cart`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error removing commodity:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  return (
    <CartActionsContext.Provider
      value={{
        addOneToCart,
        addQuantityCommodityToCart,
        removeItemFromCart,
        fetchParticipantId,
        loadingItemId,
        hasCart,
      }}
    >
      {children}
    </CartActionsContext.Provider>
  );
};