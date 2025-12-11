// backend\src\stripe\services\stripe.service.ts
/* eslint-disable no-console */
// https://youtu.be/_Z5hVtn1TqY?si=IqXPM09yIasUT2sI

import Stripe from 'stripe';
import { buildLineItems } from './stripe.functions.helper';
import type {
  CartType,
  ParticipantType,
  ShippingInfoType,
  lineItemsType,
} from '../types/stripe.types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('missing env variables');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// παίρνει απο το φροντ το cart και της πληροφορίες του πελάτη ως μεταντατα.
const createCheckoutSession = async (
  cart: CartType,
  participantInfo: Partial<ParticipantType> = {},
  shippingInfo: Partial<ShippingInfoType> = {}
) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  // const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  // added to get the participant info from front to be able to create a new transaction -> metadata come from front
  const metadata = {
    participantId: participantInfo._id?.toString() || '',
    name: participantInfo.name || '',
    surname: participantInfo.surname || '',
    email: participantInfo.email as string,
    shippingEmail: shippingInfo.shippingEmail as string,
    fullName: shippingInfo.fullName || '',
    addressLine1: shippingInfo.addressLine1 || '',
    addressLine2: shippingInfo.addressLine2 || '',
    city: shippingInfo.city || '',
    postalCode: shippingInfo.postalCode || '',
    country: shippingInfo.country || '',
    phone: shippingInfo.phone || '',
    notes: shippingInfo.notes || '',
    shippingMethod:
      (shippingInfo as ShippingInfoType).shippingMethod || 'pickup',
  };
  console.log('Creating checkout session with metadata:', metadata);

  const line_items: lineItemsType[] = buildLineItems(
    cart,
    shippingInfo.shippingMethod
  );

  //Stripe will still show  Google Pay / Revolut if you have them enabled in your dashboard.
  console.log('🔥🔥🔥 METADATA SENT TO STRIPE:');
  console.log(JSON.stringify(metadata, null, 2));

  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    success_url: `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
    metadata: metadata,
  });
};

const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

export const stripeService = {
  createCheckoutSession,
  retrieveSession,
};
