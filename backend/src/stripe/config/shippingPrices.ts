export const SHIPPING_PRICE_IDS: Record<'courier'|'boxnow', string> = {
  courier: process.env.STRIPE_PRICE_ID_SHIPPING_COURIER!,
  boxnow: process.env.STRIPE_PRICE_ID_SHIPPING_BOXNOW!,
};