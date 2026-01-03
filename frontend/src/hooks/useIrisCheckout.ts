// frontend/src/hooks/useIrisCheckout.ts
import axios from "axios";
import { useContext } from "react";
import { VariablesContext } from "../context/VariablesContext";
import type { ShippingInfoType } from "../types/commerce.types";

export const useIrisCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleIrisCheckout = async (shippingInfo: ShippingInfoType) => {
    if (!globalParticipant?._id) {
      console.error("No participant found");
      return;
    }

    const sessionId = `IRIS_${crypto.randomUUID()}`;

    const shippingWithIrisNote: ShippingInfoType = {
      ...shippingInfo,
      notes: [shippingInfo.notes, "⚠️⚠️ αυτή είναι μια αγορά μέσω IRIS ⚠️⚠️"]
        .filter(Boolean)
        .join("\n"),
    };

    try {
      const response = await axios.post(`${url}/api/transaction`, {
        participant: globalParticipant._id,
        sessionId,
        shipping: shippingWithIrisNote,
      });

      console.log("IRIS transaction created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error during IRIS checkout:", error);
      throw error;
    }
  };

  return { handleIrisCheckout };
};
