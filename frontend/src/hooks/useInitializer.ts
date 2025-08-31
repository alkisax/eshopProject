// src/hooks/useCartInitializer.ts
import { useEffect } from "react";
import axios from "axios";
import type { ParticipantType, CartType } from "../types/commerce.types";
import type { IUser } from "../types/types";

export const useInitializer = (
  user: IUser | null,
  url: string, //from context
  setHasCart: (value: boolean) => void, //from context
  setGlobalParticipant: (p: ParticipantType | null) => void
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
          setGlobalParticipant(null);
          return null;
        }
      }
      // if all fails
      setGlobalParticipant(null);
      return null;
    };

    const checkCart = async (participant: ParticipantType | null) => {
      if (!participant?._id) {
        setHasCart(false);
        return;
      }

      try {
        const res = await axios.get<{ status: boolean; data: CartType }>(
          `${url}/api/cart/${participant._id}`
        );
        setHasCart(res.data.data.items.length > 0);
      } catch {
        setHasCart(false);
      }
    };
    
  const runChecks = async () => {
    const participant = await checkParticipant();
    await checkCart(participant);
  };

  runChecks();
  }, [user, url, setGlobalParticipant, setHasCart]);
};
