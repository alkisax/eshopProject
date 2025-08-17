// __test__/stripe.test.js

// 1) Mock the Stripe library so it never talks to the real Stripe API:
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        // Default: succeed with this fake session
        create: jest.fn().mockResolvedValue({
          id: 'mock_session_id',
          url: 'https://mock-stripe-url.com/checkout'
        })
      }
    }
  }));
});

const request = require('supertest');
const app = require('../app');

describe('Stripe Controller', () => {
  describe('POST /api/stripe/checkout/:price_id', () => {

    it('should create a checkout session and return it', async () => {
      const response = await request(app)
        .post('/api/stripe/checkout/mock_price_id')
        .send({
          participantInfo: {
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com'
          }
        });

      expect(response.status).toBe(200);
      // We only check that our mock data comes back:
      expect(response.body).toHaveProperty('id', 'mock_session_id');
      expect(response.body).toHaveProperty(
        'url',
        'https://mock-stripe-url.com/checkout'
      );
    });
  });
});
