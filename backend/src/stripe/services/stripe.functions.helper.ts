// backend\src\stripe\services\stripe.functions.helper.ts
import type { CartType, CartItemType, CommodityType, lineItemsType } from '../types/stripe.types';
import { SHIPPING_PRICE_IDS } from '../config/shippingPrices';

// για την τιμή φωνάζουμε το price_id του stripe και οχι το commodity.price γιατί η τιμή πρέπει να είναι hardcoded στο dashboard του stripe για λόγους ασφαλείας
// εχουμε cart{_id,  participant: Types.ObjectId | string | ParticipantType items: CartItemType[];}. Οπότε για να βρούμε το stripePriceId πάμε cart.items.commodity.stripePriceId, ενώ για quantity, cart.items.quantity. δες types
export const buildLineItems =  (
  cart: CartType,
  shippingMethod?: 'courier' | 'boxnow' | 'pickup'
): lineItemsType[] => {
  const items =  cart.items.map((item: CartItemType) => ({
    price: (item.commodity as CommodityType).stripePriceId,
    quantity: item.quantity as number  
  }));
  if (shippingMethod && shippingMethod !== 'pickup') {
    items.push({
      price: SHIPPING_PRICE_IDS[shippingMethod], 
      quantity: 1,
    });
  }

  return items;
};