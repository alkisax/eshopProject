"use strict";
/* eslint-disable no-console */
// https://youtu.be/_Z5hVtn1TqY?si=IqXPM09yIasUT2sI
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe_functions_helper_1 = require("./stripe.functions.helper");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('missing env variables');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
// παίρνει απο το φροντ το cart και της πληροφορίες του πελάτη ως μεταντατα.
const createCheckoutSession = async (cart, participantInfo = {}, shippingInfo = {}) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
    // added to get the participant info from front to be able to create a new transaction -> metadata come from front
    const metadata = {
        name: participantInfo.name || '',
        surname: participantInfo.surname || '',
        email: participantInfo.email,
        shippingEmail: shippingInfo.shippingEmail,
        fullName: shippingInfo.fullName || '',
        addressLine1: shippingInfo.addressLine1 || '',
        addressLine2: shippingInfo.addressLine2 || '',
        city: shippingInfo.city || '',
        postalCode: shippingInfo.postalCode || '',
        country: shippingInfo.country || '',
        phone: shippingInfo.phone || '',
        notes: shippingInfo.notes || '',
    };
    console.log('Creating checkout session with metadata:', metadata);
    const line_items = (0, stripe_functions_helper_1.buildLineItems)(cart);
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
const retrieveSession = async (sessionId) => {
    return await stripe.checkout.sessions.retrieve(sessionId);
};
exports.stripeService = {
    createCheckoutSession,
    retrieveSession
};
//# sourceMappingURL=stripe.service.js.map