const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const QUANTITY = 1; // just number not string

// παίρνει απο το φροντ το price_id και της πληροφορίες του πελάτη για να τις περάσει ως μεταντατα. Αργοτερα κατάλαβα οτι τα μεταντατα χάνονται, αλλα το αφήνω εδώ γιατι μπορεί να φανει χρήσιμο
const createCheckoutSession = async (price_id, participantInfo = {}) => {
  const BACKEND_URL = process.env.YOUR_DOMAIN || 'http://localhost:3000';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://http://localhost:5173'

  // added to get the participant info from front to be able to create a new transaction
  const metadata = {
    name: participantInfo.name || '',
    surname: participantInfo.surname || '',
    email: participantInfo.email
  }
  console.log('Creating checkout session with metadata:', metadata);

  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: price_id,
        quantity: QUANTITY,
      },
    ],
    mode: 'payment',

    // success_url: `${BACKEND_URL}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
    success_url: `${FRONTEND_URL}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
    metadata: metadata

  });
};

const retrieveSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

module.exports = {
  createCheckoutSession,
  retrieveSession
};
