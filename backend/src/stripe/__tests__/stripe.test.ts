import request from 'supertest';
import app from '../../app';
// import { stripeService } from '../services/stripe.service';

// Mock appwrite (to avoid env crashes)
jest.mock('../../utils/appwrite.ts', () => ({
  account: {},
  OAuthProvider: { Google: 'google' },
}));

// Mock services + DAOs
const mockCreateCheckoutSession = jest.fn();
const mockRetrieveSession = jest.fn();
jest.mock('../services/stripe.service', () => ({
  stripeService: {
    createCheckoutSession: (...args: any[]) => mockCreateCheckoutSession(...args),
    retrieveSession: (...args: any[]) => mockRetrieveSession(...args),
  },
}));

const mockFindBySessionId = jest.fn();
const mockCreateTransaction = jest.fn();
jest.mock('../daos/transaction.dao', () => ({
  transactionDAO: {
    findBySessionId: (...args: any[]) => mockFindBySessionId(...args),
    createTransaction: (...args: any[]) => mockCreateTransaction(...args),
  },
}));

const mockFindParticipantByEmail = jest.fn();
const mockCreateParticipant = jest.fn();
jest.mock('../daos/participant.dao', () => ({
  participantDao: {
    findParticipantByEmail: (...args: any[]) => mockFindParticipantByEmail(...args),
    createParticipant: (...args: any[]) => mockCreateParticipant(...args),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Stripe Controller', () => {
  describe('POST /api/stripe/checkout/:price_id', () => {
    it('returns 200 with checkout session', async () => {
      mockCreateCheckoutSession.mockResolvedValue({ id: 'mock_id', url: 'mock_url' });

      const res = await request(app)
        .post('/api/stripe/checkout/test_price')
        .send({ participantInfo: { email: 'john@example.com' } });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: 'mock_id', url: 'mock_url' });
    });

    it('returns 500 if service throws', async () => {
      mockCreateCheckoutSession.mockRejectedValue(new Error('fail'));

      const res = await request(app).post('/api/stripe/checkout/test_price');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/stripe/success', () => {
    it('returns 400 if no session_id', async () => {
      const res = await request(app).get('/api/stripe/success');
      expect(res.status).toBe(400);
    });

    it('returns 409 if transaction already exists', async () => {
      mockFindBySessionId.mockResolvedValue({ _id: 't1' });

      const res = await request(app).get('/api/stripe/success?session_id=abc');
      expect(res.status).toBe(409);
    });

    it('returns 400 if no email in session', async () => {
      mockFindBySessionId.mockResolvedValue(null);
      mockRetrieveSession.mockResolvedValue({ metadata: {}, amount_total: 100 });

      const res = await request(app).get('/api/stripe/success?session_id=abc');
      expect(res.status).toBe(400);
    });

    it('returns 400 if amount is 0', async () => {
      mockFindBySessionId.mockResolvedValue(null);
      mockRetrieveSession.mockResolvedValue({ metadata: { email: 'a@b.c' }, amount_total: 0 });

      const res = await request(app).get('/api/stripe/success?session_id=abc');
      expect(res.status).toBe(400);
    });

    it('creates new participant if not found', async () => {
      mockFindBySessionId.mockResolvedValue(null);
      mockRetrieveSession.mockResolvedValue({ metadata: { email: 'a@b.c' }, amount_total: 200 });
      mockFindParticipantByEmail.mockResolvedValue(null);
      mockCreateParticipant.mockResolvedValue({ _id: 'p1', email: 'a@b.c' });
      mockCreateTransaction.mockResolvedValue({ _id: 't1' });

      const res = await request(app).get('/api/stripe/success?session_id=abc');
      expect(res.status).toBe(200);
      expect(mockCreateParticipant).toHaveBeenCalled();
      expect(mockCreateTransaction).toHaveBeenCalled();
    });

    it('uses existing participant if found', async () => {
      mockFindBySessionId.mockResolvedValue(null);
      mockRetrieveSession.mockResolvedValue({ metadata: { email: 'a@b.c' }, amount_total: 200 });
      mockFindParticipantByEmail.mockResolvedValue({ _id: 'p1', email: 'a@b.c' });
      mockCreateTransaction.mockResolvedValue({ _id: 't1' });

      const res = await request(app).get('/api/stripe/success?session_id=abc');
      expect(res.status).toBe(200);
      expect(mockFindParticipantByEmail).toHaveBeenCalledWith('a@b.c');
      expect(mockCreateTransaction).toHaveBeenCalled();
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
