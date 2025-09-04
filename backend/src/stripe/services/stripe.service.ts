/* eslint-disable no-console */
// https://youtu.be/_Z5hVtn1TqY?si=IqXPM09yIasUT2sI

import Stripe from 'stripe';
import { buildLineItems } from './stripe.functions.helper';
import type { CartType, ParticipantType, lineItemsType } from '../types/stripe.types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error ('missing env variables');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// παίρνει απο το φροντ το cart και της πληροφορίες του πελάτη ως μεταντατα.
const createCheckoutSession = async (
  cart: CartType, 
  participantInfo: Partial<ParticipantType> = {}
) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  // added to get the participant info from front to be able to create a new transaction -> metadata come from front
  const metadata = {
    name: participantInfo.name || '',
    surname: participantInfo.surname || '',
    email: participantInfo.email as string
  };
  console.log('Creating checkout session with metadata:', metadata);

  const line_items: lineItemsType[] = buildLineItems(cart);

  //Stripe will still show  Google Pay / Revolut if you have them enabled in your dashboard.
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'revolut_pay'],
    line_items,
    success_url: `${BACKEND_URL}/api/stripe/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
    metadata: metadata
  });
};

const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

export const stripeService = {
  createCheckoutSession,
  retrieveSession
};
