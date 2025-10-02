
import { useEffect } from "react";
import axios from "axios";
import type { ParticipantType, CartType } from "../types/commerce.types";
import type { IUser } from "../types/types";

export const useInitializer = (
  user: IUser | null,
  url: string, //from context
  setHasCart: (value: boolean) => void, //from context
  setHasFavorites: (value: boolean) => void,
  setGlobalParticipant: (p: ParticipantType | null) => void,
  setCartCount: (count: number) => void
) => {

  useEffect(() => {
    const checkParticipant = async (): Promise<ParticipantType | null> => {
      if (user?.email) {
        try {
          const res = await axios.get<{ status: boolean; data: ParticipantType }>(
            `${url}/api/participant/by-email?email=${user.email}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          setGlobalParticipant(res.data.data);
          return res.data.data;
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.log("No participant found for this user yet.");
            setGlobalParticipant(null);
            return null;
          }
          // console.error("❌ Error fetching participant -initialiser-:", err);
          throw err; // bubble up other errors
        }
      }

      // 🔹 Guest participant from localStorage
      const storedParticipantId = localStorage.getItem("guestParticipantId");
      if (storedParticipantId) {
        try {
          const res = await axios.get<{ status: boolean; data: ParticipantType }>(
            `${url}/api/participant/${storedParticipantId}`
          );
          setGlobalParticipant(res.data.data);
          return res.data.data;
        } catch {
          // console.warn("⚠️ Guest participant not found -initialiser-");
          setGlobalParticipant(null);
          return null;
        }
      }
      // if all fails
      // console.log("⚠️ No participant at all -initialiser-");
      setGlobalParticipant(null);
      return null;
    };

    const checkCart = async (participant: ParticipantType | null) => {
      if (!participant?._id) {
        // console.log("⚠️ No participant ID → no cart -initialiser-");
        setHasCart(false);
        setCartCount(0);
        return;
      }

      try {
        const res = await axios.get<{ status: boolean; data: CartType }>(
          `${url}/api/cart/${participant._id}`
        );
        // console.log("✅ Cart response -initialiser-:", res.data.data);
        setHasCart(res.data.data.items.length > 0);
        setCartCount(res.data.data.items.length);
      } catch (err) {
        console.error("❌ Error fetching cart -initialiser-:", err);
        setHasCart(false);
        setCartCount(0);
      }
    };

    const checkFavorites = async (user: IUser | null) => {
      if (!user?._id) {
        setHasFavorites(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favs: string[] = res.data.data.favorites || [];
        setHasFavorites(favs.length > 0);
      } catch (err) {
        console.error("❌ Error fetching favorites -initializer-", err);
        setHasFavorites(false);
      }
    };

    
    const runChecks = async () => {
      // console.log("🚀 Running initializer for user:", user?.email);
      const participant = await checkParticipant();
      await checkCart(participant);
      await checkFavorites(user);
    };

    if (user) {
      runChecks();
    }

  }, [user, url, setGlobalParticipant, setHasCart, setCartCount, setHasFavorites]);
};
