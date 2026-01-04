// frontend\src\utils\shippingNotes.ts
import type { ShippingInfoType } from '../types/commerce.types';

export const appendShippingMethodToNotes = (
  shipping: ShippingInfoType
): ShippingInfoType => {

  const methodLabel = shipping.shippingMethod;

  return {
    ...shipping,
    notes: [
      shipping.notes,
      `🚚 Τρόπος αποστολής: ${methodLabel}`,
    ]
      .filter(Boolean) // για να αφαιρέσουμε τις άδειες τιμες αν υπάρχουν
      .join('\n'),
  };
};
