// frontend/src/hooks/useCashOnDeliveryCheckout.ts
import axios from 'axios';
import { useContext } from 'react';
import { VariablesContext } from '../context/VariablesContext';
import type { ShippingInfoType } from '../types/commerce.types';
import { appendShippingMethodToNotes } from '../utils/shippingNotes';

export const useCashOnDeliveryCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCashOnDeliveryCheckout = async (
    shippingInfo: ShippingInfoType
  ) => {
    if (!globalParticipant?._id) {
      console.error('No participant found');
      return;
    }

    const sessionId = `COD_${crypto.randomUUID()}`;

    const shippingWithNotes = appendShippingMethodToNotes(shippingInfo);

    const shippingWithCodNote: ShippingInfoType = {
      ...shippingWithNotes,
      notes: [
        shippingWithNotes.notes,
        '💶 Πληρωμή κατά την παραλαβή (COD)',
      ]
        .filter(Boolean)
        .join('\n'),
    };

    try {
      const response = await axios.post(`${url}/api/transaction`, {
        participant: globalParticipant._id,
        sessionId,
        shipping: shippingWithCodNote,
      });

      console.log('COD transaction created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error during COD checkout:', error);
      throw error;
    }
  };

  return { handleCashOnDeliveryCheckout };
};
