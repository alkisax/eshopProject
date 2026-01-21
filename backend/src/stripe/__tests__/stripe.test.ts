process.env.APPWRITE_ENDPOINT = 'http://dummy';
process.env.APPWRITE_PROJECT_ID = 'dummy';
process.env.APPWRITE_API_KEY = 'dummy';
process.env.JWT_SECRET = 'test_secret';
// Mock appwrite (to avoid env crashes)
jest.mock('../../utils/appwrite.ts', () => ({
  account: {},
  OAuthProvider: { Google: 'google' },
}));

import request from 'supertest';
import app from '../../app';
import { Types } from 'mongoose';
import type { CartType } from '../types/stripe.types';

// Mock services + DAOs (except cartDAO, which we spy on)
const mockCreateCheckoutSession = jest.fn();
const mockRetrieveSession = jest.fn();
jest.mock('../services/stripe.service', () => ({
  stripeService: {
    createCheckoutSession: (...args: unknown[]) =>
      mockCreateCheckoutSession(...args),
    retrieveSession: (...args: unknown[]) => mockRetrieveSession(...args),
  },
}));

const mockFindBySessionId = jest.fn();
const mockCreateTransaction = jest.fn();
jest.mock('../daos/transaction.dao', () => ({
  transactionDAO: {
    findBySessionId: (...args: unknown[]) => mockFindBySessionId(...args),
    createTransaction: (...args: unknown[]) => mockCreateTransaction(...args),
  },
}));

const mockFindParticipantByEmail = jest.fn();
const mockCreateParticipant = jest.fn();
jest.mock('../daos/participant.dao', () => ({
  participantDao: {
    findParticipantByEmail: (...args: unknown[]) =>
      mockFindParticipantByEmail(...args),
    createParticipant: (...args: unknown[]) => mockCreateParticipant(...args),
  },
}));

// Mock fetchCart (still full mock)
const mockFetchCart = jest.fn();
jest.mock('../daos/stripe.dao', () => ({
  fetchCart: (...args: unknown[]) => mockFetchCart(...args),
}));

// Import cartDAO normally so we can spy on it
// import { cartDAO } from '../daos/cart.dao';

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Minimal mock cart
const mockCart: CartType = {
  _id: new Types.ObjectId(),
  participant: new Types.ObjectId(),
  items: [],
};

describe('Stripe Controller', () => {
  describe('POST /api/stripe/checkout/cart', () => {
    it('returns 200 with checkout session', async () => {
      mockFetchCart.mockResolvedValue(mockCart);
      mockCreateCheckoutSession.mockResolvedValue({
        id: 'mock_id',
        url: 'mock_url',
      });

      const res = await request(app)
        .post('/api/stripe/checkout/cart')
        .send({
          participantId: mockCart.participant.toString(),
          participantInfo: {
            _id: mockCart.participant.toString(),
            email: 'john@example.com',
            name: 'John',
          },
          shippingInfo: {
            fullName: 'John Doe',
            addressLine1: '123 Main St',
            city: 'Athens',
            postalCode: '12345',
            country: 'GR',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: 'mock_id', url: 'mock_url' });
    });

    it('returns 500 if service throws', async () => {
      mockFetchCart.mockResolvedValue(mockCart);
      mockCreateCheckoutSession.mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .post('/api/stripe/checkout/cart')
        .send({
          participantId: mockCart.participant.toString(),
          participantInfo: {
            _id: mockCart.participant.toString(),
            email: 'john@example.com',
            name: 'John',
          },
          shippingInfo: {
            fullName: 'John Doe',
            addressLine1: '123 Main St',
            city: 'Athens',
            postalCode: '12345',
            country: 'GR',
          },
        });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/stripe/cancel', () => {
    it('returns cancel message', async () => {
      const res = await request(app).get('/api/stripe/cancel');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Payment canceled');
    });
  });
});
