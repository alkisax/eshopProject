import Stripe from 'stripe';
import type { CartType, ParticipantType, ShippingInfoType } from '../types/stripe.types';
export declare const stripeService: {
    createCheckoutSession: (cart: CartType, participantInfo?: Partial<ParticipantType>, shippingInfo?: Partial<ShippingInfoType>) => Promise<Stripe.Response<Stripe.Checkout.Session>>;
    retrieveSession: (sessionId: string) => Promise<Stripe.Response<Stripe.Checkout.Session>>;
};
