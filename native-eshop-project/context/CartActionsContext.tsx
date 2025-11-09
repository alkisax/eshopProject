import React, { createContext, useContext, useState, type ReactNode } from 'react';
import axios, { isAxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type {
  ParticipantType,
  CartType,
} from '@/types/commerce.types';
import { VariablesContext } from './VariablesContext';
import { UserAuthContext } from './UserAuthContext';

interface CartActionsContextType {
  addOneToCart: (commodityId: string) => Promise<void>;
  removeItemFromCart: (participantId: string, commodityId: string) => Promise<void>;
  addQuantityCommodityToCart: (
    participantId: string,
    commodityId: string,
    quantity: number
  ) => Promise<void>;
  fetchParticipantId: () => Promise<string | null>;
  loadingItemId: string | null;
  hasCart: boolean;
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
}

export const CartActionsContext = createContext<CartActionsContextType>({
  addOneToCart: async () => {
    throw new Error('addOneToCart not implemented');
  },
  removeItemFromCart: async () => {
    throw new Error('removeItemFromCart not implemented');
  },
  addQuantityCommodityToCart: async () => {
    throw new Error('addQuantityCommodityToCart not implemented');
  },
  fetchParticipantId: async () => null,
  loadingItemId: null,
  hasCart: false,
  cartCount: 0,
  setCartCount: () => {},
});

export const CartActionsProvider = ({ children }: { children: ReactNode }) => {
  const { setGlobalParticipant, url, hasCart, setHasCart } =
    useContext(VariablesContext);
  const { user } = useContext(UserAuthContext);

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // ---- storage helpers (web vs native) ----
  const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
  };

  const getGuestParticipantId = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('guestParticipantId');
    }
    return await SecureStore.getItemAsync('guestParticipantId');
  };

  const setGuestParticipantId = async (id: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem('guestParticipantId', id);
      return;
    }
    await SecureStore.setItemAsync('guestParticipantId', id);
  };

  const removeGuestParticipantId = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('guestParticipantId');
      return;
    }
    await SecureStore.deleteItemAsync('guestParticipantId');
  };

  // ---------- 1/2: find or create participant ----------
  const fetchParticipantId = async (): Promise<string | null> => {
    console.log('enter addToCart');

    // ✅ Logged-in user
    if (user) {
      console.log('step 1. user from context:', user);
      const email = user.email;
      if (!email) {
        console.error('email is required');
        return null;
      }

      // 2. try to find participant by email
      try {
        const token = await getToken();
        const response = await axios.get<{
          status: boolean;
          data: ParticipantType;
        }>(`${url}/api/participant/by-email`, {
          params: { email },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const found = response.data.data;
        setGlobalParticipant(found);
        return found._id ?? null;
      } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 404) {
          console.log('No participant found, will create a new one...');
        } else {
          console.error('Error fetching participant by email', err);
          return null;
        }
      }

      // 3. user exists but has no participant: create
      console.log('step 3. creating participant for existing user');

      const newParticipantData = {
        name: user.name,
        surname: user.surname,
        email: user.email,
        user: user._id,
        transactions: [],
      };

      const response = await axios.post<{
        status: boolean;
        data: ParticipantType;
      }>(`${url}/api/participant/`, newParticipantData);

      const newParticipant = response.data.data;
      setGlobalParticipant(newParticipant);

      console.log(
        `User associated with new participant. id: ${newParticipant._id}`
      );
      return newParticipant._id ?? null;
    }

    // ✅ Guest user
    console.log(
      'step 4. no existing user → create or reuse guest participant'
    );

    // 4a. Try restore guest
    const storedParticipantId = await getGuestParticipantId();
    if (storedParticipantId) {
      try {
        const response = await axios.get<{
          status: boolean;
          data: ParticipantType;
        }>(`${url}/api/participant/${storedParticipantId}`);

        const guest = response.data.data;
        setGlobalParticipant(guest);
        console.log('Guest restored from storage:', guest);
        return guest._id ?? null;
      } catch (err: unknown) {
        console.warn(
          'Stored guest not found in DB, creating a new one...',
          err
        );
        await removeGuestParticipantId();
      }
    }

    // 4c. Create new guest participant
    const uuidGuest = uuidv4();
    const guestEmail = `guest-${uuidGuest}@eshop.local`;

    const newParticipantData = {
      name: '',
      surname: '',
      email: guestEmail,
      transactions: [],
    };

    const response = await axios.post<{
      status: boolean;
      data: ParticipantType;
    }>(`${url}/api/participant/`, newParticipantData);

    const newParticipant = response.data.data;
    setGlobalParticipant(newParticipant);
    await setGuestParticipantId(newParticipant._id!.toString());

    console.log(
      `Guest associated with new participant. id: ${newParticipant._id}, email: ${newParticipant.email}`
    );
    return newParticipant._id ?? null;
  };

  // ---------- 2/2: ensure cart + change quantity ----------
  const addQuantityCommodityToCart = async (
    participantId: string,
    commodityId: string,
    quantity: number
  ): Promise<void> => {
    console.log('Creating cart for participantId:', participantId);
    try {
      // ensure cart exists (cart DAO auto-creates if missing)
      const cartRes = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}`
      );
      const ensuredCart = cartRes.data.data;
      console.log('ensured cart:', ensuredCart);

      const data = { commodityId, quantity };

      await axios.patch<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}/items`,
        data
      );
      console.log(`item id:${commodityId}, quantity: ${quantity} reached cart`);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error(
          'Error adding commodity to cart:',
          err.response?.data || err.message
        );
      } else {
        console.error('Unexpected error:', err);
      }
    }
  };

  const addOneToCart = async (commodityId: string): Promise<void> => {
    setLoadingItemId(commodityId);
    try {
      const participantId = await fetchParticipantId();
      if (!participantId) {
        console.error('No participantId available, cannot add to cart');
        return;
      }

      await addQuantityCommodityToCart(participantId, commodityId, 1);
      setHasCart(true); // optimistic

      // ---- refresh cart from backend for accurate badge ----
      const cartRes = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}`
      );
      const cart = cartRes.data.data;
      setHasCart(cart.items.length > 0);
      setCartCount(
        cart.items.reduce((sum, item) => sum + item.quantity, 0)
      );

      console.log('cart items:', cart.items);

      // (Optional) here you could also fire analytics if you want
      // using a GA library supported in native.
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error(
          'Error adding commodity to cart:',
          err.response?.data || err.message
        );
      } else {
        console.error('Unexpected error:', err);
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
        { commodityId, quantity: -99999 }
      );

      // 🧠 Re-fetch latest cart for accurate badge + hasCart
      const res = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${participantId}`
      );
      const cart = res.data.data;

      setCartCount(cart.items.reduce((sum, item) => sum + item.quantity, 0));
      setHasCart(cart.items.length > 0);

      console.log(`✅ Removed commodity ${commodityId}. Cart now has ${cart.items.length} items`);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error('Error removing commodity:', err.response?.data || err.message);
      } else {
        console.error('Unexpected error:', err);
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
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </CartActionsContext.Provider>
  );
};
