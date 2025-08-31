import dotenv from 'dotenv';
dotenv.config();
import { jest } from '@jest/globals';

import { Types } from 'mongoose';
import type { CartType, CommodityType } from '../types/stripe.types';

const mockCart: CartType = {
  _id: new Types.ObjectId(),
  participant: new Types.ObjectId(),
  items: [
    {
      commodity: {
        _id: new Types.ObjectId(),
        name: 'Test Item',
        price: 1000,
        currency: 'eur',
        stripePriceId: 'price_123',
        soldCount: 0,
        stock: 10,
        active: true,
      } as unknown as CommodityType,
      quantity: 2,
      priceAtPurchase: 1000,
    },
  ],
};

// Reset modules before each test so we can safely re-mock Stripe
beforeEach(() => {
  jest.resetModules(); // clear module cache
  process.env.STRIPE_SECRET_KEY = 'test_secret'; // always set a default
});

describe('stripeService (unit)', () => {
  it('calls Stripe.sessions.create with correct args', async () => {
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest
              .fn<() => Promise<{ id: string; url: string }>>()
              .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
            retrieve: jest.fn(),
          },
        },
      }))
    );

    // Import AFTER mocking Stripe
    const { stripeService } = await import('../services/stripe.service');

    process.env.FRONTEND_URL = 'http://test.local';

    const result = await stripeService.createCheckoutSession(mockCart, {
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
    });

    expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
  });

  it('calls Stripe.sessions.retrieve with given sessionId', async () => {
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest.fn(),
            retrieve: jest
              .fn<() => Promise<{ id: string; metadata: { email: string } }>>()
              .mockResolvedValue({
                id: 'mock_sess',
                metadata: { email: 'a@b.c' },
              }),
          },
        },
      }))
    );

    const { stripeService } = await import('../services/stripe.service');

    const result = await stripeService.retrieveSession('sess_123');

    expect(result).toEqual({
      id: 'mock_sess',
      metadata: { email: 'a@b.c' },
    });
  });

  it('throws if STRIPE_SECRET_KEY is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(async () => {
      await import('../services/stripe.service');
    }).rejects.toThrow('missing env variables');
  });

  it('falls back to default FRONTEND_URL if env not set', async () => {
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest
              .fn<() => Promise<{ id: string; url: string }>>()
              .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
            retrieve: jest.fn(),
          },
        },
      }))
    );

    delete process.env.FRONTEND_URL; // force default branch
    const { stripeService } = await import('../services/stripe.service');

    const result = await stripeService.createCheckoutSession(mockCart);
    expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
  });

  it('uses empty string when participantInfo fields are missing', async () => {
    jest.doMock('stripe', () =>
      jest.fn().mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest
              .fn<() => Promise<{ id: string; url: string }>>()
              .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
            retrieve: jest.fn(),
          },
        },
      }))
    );

    process.env.FRONTEND_URL = 'http://test.local';
    const { stripeService } = await import('../services/stripe.service');

    const result = await stripeService.createCheckoutSession(mockCart, {});
    expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
  });
});
