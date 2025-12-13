import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import Stripe from 'stripe';
import app from '../../app';

// We don't need DB here because we spy on the DAOs for the "completed" flow.
import { transactionDAO } from '../daos/transaction.dao';
import { participantDao } from '../daos/participant.dao';
import { cartDAO } from '../daos/cart.dao';
import { Types } from 'mongoose';

const WEBHOOK_PATH = '/api/stripe/webhook';

if (!process.env.STRIPE_SECRET_KEY) {
  // Handler requires this to exist even though we don't hit Stripe network.
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_123';
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  // Needed to generate a valid Stripe signature for tests.
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_123';
}

const makeSignedRequest = async (payloadObj: unknown, headerOverride?: string) => {
  const payload = JSON.stringify(payloadObj);
  const signature =
    headerOverride ??
    Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

  return request(app)
    .post(WEBHOOK_PATH)
    .set('Stripe-Signature', signature)
    .set('Content-Type', 'application/json')
    .send(payload);
};

describe('Stripe webhook – signature & basic flows (no mocks)', () => {
  it('400 when Stripe-Signature header is missing', async () => {
    const res = await request(app)
      .post(WEBHOOK_PATH)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));

    expect(res.status).toBe(400);
    expect(String(res.text)).toMatch(/Missing Stripe signature/i);
  });

  it('400 when Stripe-Signature is invalid', async () => {
    const res = await makeSignedRequest({ hello: 'world' }, 't=123,v1=garbage');
    expect(res.status).toBe(400);
    expect(String(res.text)).toMatch(/Webhook Error/i);
  });

  it('200 for a valid event type we do not handle (e.g. payment_intent.succeeded)', async () => {
    const res = await makeSignedRequest({
      id: 'evt_test_1',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123' } },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });

  it('200 for checkout.session.completed but not paid (message about status)', async () => {
    const res = await makeSignedRequest({
      id: 'evt_test_2',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_not_paid',
          payment_status: 'unpaid',
          amount_total: 1234,
          metadata: {
            email: 'user@example.com',
            participantId: new Types.ObjectId().toString(),
          },
        },
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(String(res.body.message)).toMatch(/Payment status: unpaid/i);
  });
});

describe('Stripe webhook – checkout.session.completed (with scoped spies)', () => {
  // it('200 + creates transaction + clears cart when paid and not duplicate', async () => {
  //   const participantId = new Types.ObjectId();
  //   const sessionId = 'cs_test_abc123';

  //   // Scoped spies, restored at the end of the test
  //   const spyFindBySession = jest
  //     .spyOn(transactionDAO, 'findBySessionId')
  //     .mockResolvedValueOnce(null);

  //   const fakeParticipant = {
  //     _id: participantId,
  //     email: 'buyer@example.com',
  //   };
  //   const spyFindParticipant = jest
  //     .spyOn(participantDao, 'findParticipantById')
  //     .mockResolvedValueOnce(fakeParticipant as never);

  //   const fakeTransaction = {
  //     amount: 12.34,
  //     items: [
  //       { commodity: new Types.ObjectId(), quantity: 2, priceAtPurchase: 6.17 },
  //     ],
  //   };
  //   const spyCreateTx = jest
  //     .spyOn(transactionDAO, 'createTransaction')
  //     .mockResolvedValueOnce(fakeTransaction as never);

  //   const spyClearCart = jest
  //     .spyOn(cartDAO, 'clearCart')
  //     .mockResolvedValueOnce({} as unknown as import('../types/stripe.types').CartType);


  //   const res = await makeSignedRequest({
  //     id: 'evt_test_3',
  //     object: 'event',
  //     type: 'checkout.session.completed',
  //     data: {
  //       object: {
  //         id: sessionId,
  //         payment_status: 'paid',
  //         amount_total: 1234, // cents (logging only)
  //         metadata: {
  //           email: 'buyer@example.com',
  //           participantId: participantId.toString(),
  //           shippingEmail: 'buyer@example.com',
  //           fullName: 'Buyer Name',
  //           addressLine1: '123 Test St',
  //           addressLine2: '',
  //           city: 'Testville',
  //           postalCode: '12345',
  //           country: 'GR',
  //           phone: '',
  //           notes: '',
  //         },
  //       },
  //     },
  //   });

  //   expect(res.status).toBe(200);
  //   expect(res.body).toEqual({ received: true });

  //   expect(spyFindBySession).toHaveBeenCalledWith(sessionId);
  //   expect(spyFindParticipant).toHaveBeenCalledWith(participantId.toString());

  //   expect(spyCreateTx).toHaveBeenCalledTimes(1);
  //   const createArgs = spyCreateTx.mock.calls[0];
  //   expect(createArgs[0].toString()).toBe(participantId.toString());
  //   expect(createArgs[1]).toBe(sessionId);
  //   expect(createArgs[2]).toMatchObject({
  //     shippingEmail: 'buyer@example.com',
  //     fullName: 'Buyer Name',
  //     addressLine1: '123 Test St',
  //     city: 'Testville',
  //     postalCode: '12345',
  //     country: 'GR',
  //   });

  //   expect(spyClearCart).toHaveBeenCalledWith(participantId);

  //   // cleanup spies
  //   spyFindBySession.mockRestore();
  //   spyFindParticipant.mockRestore();
  //   spyCreateTx.mockRestore();
  //   spyClearCart.mockRestore();
  // });

  it('200 + short-circuits when duplicate session', async () => {
    const sessionId = 'cs_test_dup';
    const spyFindBySession = jest
      .spyOn(transactionDAO, 'findBySessionId')
      .mockResolvedValueOnce({ _id: new Types.ObjectId() } as never);

    const res = await makeSignedRequest({
      id: 'evt_test_4',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          amount_total: 5000,
          metadata: {
            email: 'dup@example.com',
            participantId: new Types.ObjectId().toString(),
          },
        },
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(String(res.body.message)).toMatch(/already recorded/i);

    spyFindBySession.mockRestore();
  });

  it('500 when participantId missing in metadata', async () => {
    const res = await makeSignedRequest({
      id: 'evt_test_5',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_missing_p',
          payment_status: 'paid',
          amount_total: 1000,
          metadata: {
            email: 'no-participant@example.com',
            // participantId intentionally missing
          },
        },
      },
    });

    expect(res.status).toBe(500);
    expect(String(res.text)).toMatch(/Webhook handler failed/i);
  });
});
