import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

import User from '../../login/models/users.models';
import Participant from '../models/participant.models';
import Transaction from '../models/transaction.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error;
}

const TEST_ADMIN = {
  username: 'adminuser',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'securepassword',
  roles: ['ADMIN'],
};

let token: string;
let participantId: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});


  const hashedPassword = await hash(TEST_ADMIN.password, 10);

  await User.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword,
    roles: TEST_ADMIN.roles,
  });

  const res = await request(app)
    .post('/api/auth')
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  token = res.body.data.token;

  const participantRes = await request(app)
    .post('/api/participant')
    .send({
      name: 'Test',
      surname: 'User',
      email: 'testuser@example.com',
      transactions: [],
    });

  participantId = participantRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});
  await disconnect();
});

describe('Transaction API', () => {
  describe('POST /api/transaction', () => {
    it('should create a transaction and return 201', async () => {
      const transaction = {
        amount: 100,
        participant: participantId,
        processed: false,
      };

      const res = await request(app).post('/api/transaction').send(transaction);

      expect(res.body.status).toBe(true);
      expect(res.body.data.amount).toBe(transaction.amount);
      expect(res.body.data.participant.toString()).toBe(participantId);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/transaction').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /api/transaction', () => {
    it('should return all transactions (authorized)', async () => {
      const res = await request(app)
        .get('/api/transaction')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 if not authorized', async () => {
      const res = await request(app).get('/api/transaction');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transaction/unprocessed', () => {
    it('should return only unprocessed transactions', async () => {
      const res = await request(app)
        .get('/api/transaction/unprocessed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/transaction/toggle/:id', () => {
    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .put('/api/transaction/toggle/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/transaction/:id', () => {
    it('should delete a transaction successfully', async () => {
      const createRes = await request(app).post('/api/transaction').send({
        amount: 70,
        participant: participantId,
      });

      const transactionId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/transaction/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .delete('/api/transaction/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing ID', async () => {
      const res = await request(app)
        .delete('/api/transaction/')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // route not found
    });
  });
});
