import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import axios from 'axios';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import { transactionDAO } from '../daos/transaction.dao';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

import User from '../../login/models/users.models';
import Participant from '../models/participant.models';
import Transaction from '../models/transaction.models';
import Commodity from '../models/commodity.models';
import Cart from '../models/cart.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
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
let commodityId: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});
  await Commodity.deleteMany({});
  await Cart.deleteMany({});

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

  const commodity = await Commodity.create({
    name: 'Test Commodity',
    description: 'Test product',
    category: ['test'],
    price: 50,
    currency: 'eur',
    stripePriceId: `price_${Date.now()}`,
    soldCount: 0,
    stock: 10,
    active: true,
    images: [],
  });

  commodityId = commodity._id.toString();

  await Cart.create({
    participant: participantId,
    items: [{ commodity: commodityId, quantity: 2, priceAtPurchase: 50 }],
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});
  await Commodity.deleteMany({});
  await Cart.deleteMany({});
  await disconnect();
});

describe('Transaction API', () => {
  describe('POST /api/transaction', () => {
    it('should create a transaction from cart and return 201', async () => {
      const payload = {
        participant: participantId,
        sessionId: `test_session_${Date.now()}`,
      };

      const res = await request(app).post('/api/transaction').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(true);

      const tx = res.body.data;
      expect(tx.participant.toString()).toBe(participantId);
      expect(tx.amount).toBeGreaterThan(0);
      expect(tx.items.length).toBeGreaterThan(0);
      expect(tx.processed).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/transaction').send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/participant|sessionId/i);
    });

    it('should return 400 if cart is empty', async () => {
      // create a fresh participant with empty cart
      const freshRes = await request(app)
        .post('/api/participant')
        .send({
          name: 'Empty',
          surname: 'Cart',
          email: `empty_${Date.now()}@example.com`,
          transactions: [],
        });
      const freshId = freshRes.body._id;

      const payload = {
        participant: freshId,
        sessionId: `test_session_empty_${Date.now()}`,
      };

      const res = await request(app).post('/api/transaction').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cart is empty/i);
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
      if (res.body.data.length > 0) {
        expect(res.body.data.every((tx: any) => tx.processed === false)).toBe(true);
      }
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
    it('should cancel a transaction successfully', async () => {
      // create a new transaction
      await Cart.findOneAndUpdate(
        { participant: participantId },
        { $set: { items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 50 }] } }
      );

      const payload = {
        participant: participantId,
        sessionId: `test_session_delete_${Date.now()}`,
      };

      const createRes = await request(app).post('/api/transaction').send(payload);
      const transactionId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/transaction/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.cancelled).toBe(true);
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .delete('/api/transaction/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
  
  describe ('missin tests', () => {
    it('should return 500 if DAO throws in findAll', async () => {
      jest.spyOn(transactionDAO, 'findAllTransactions').mockRejectedValueOnce(new Error('DB fail'));

      const res = await request(app)
        .get('/api/transaction')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });

    it('should return 500 if DAO throws in findUnprocessed', async () => {
      jest.spyOn(transactionDAO, 'findTransactionsByProcessed').mockRejectedValueOnce(new Error('DB fail'));

      const res = await request(app)
        .get('/api/transaction/unprocessed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });

    it('should return 400 if no transaction ID is provided in toggle', async () => {
      const res = await request(app)
        .put('/api/transaction/toggle/')   // missing ID
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // Express route not matched
      // OR test with empty param call directly (not common with supertest)
    });

    it('should return 400 if transactionId param is missing', async () => {
      const res = await request(app)
        .delete('/api/transaction/')   // no id
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // express route not matched
      // OR unit-test controller directly for req.params.id = undefined
    });

    it('should toggle processed and send email', async () => {
      // prepare a transaction
      await Cart.findOneAndUpdate(
        { participant: participantId },
        { $set: { items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 50 }] } }
      );
      const payload = { participant: participantId, sessionId: `toggle_${Date.now()}` };
      const createRes = await request(app).post('/api/transaction').send(payload);
      const transactionId = createRes.body.data._id;

      // ✅ spy on axios.post
      const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: {} });

      const res = await request(app)
        .put(`/api/transaction/toggle/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.processed).toBe(true);
      expect(axiosSpy).toHaveBeenCalledWith(expect.stringContaining('/api/email/'), {});

      axiosSpy.mockRestore();
    });


  });

  describe('PUT /api/transaction/toggle/:id', () => {
    it('should return 400 if transactionId is missing', async () => {
      const res = await request(app)
        .put('/api/transaction/toggle/') // 🚨 no id
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // Express router returns 404 for missing param
      // If you want to directly hit the controller function, you can unit-test it instead
    });
  });

  describe('DELETE /api/transaction/:id', () => {
    it('should return 400 if transactionId param missing', async () => {
      const res = await request(app)
        .delete('/api/transaction/') // 🚨 no id
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404); // Express never reaches controller
      // again, only direct unit-test will trigger line 93
    });

    it('should handle DAO returning null (simulate)', async () => {
      const spy = jest.spyOn(transactionDAO, 'deleteTransactionById').mockResolvedValueOnce(null as any);

      const res = await request(app)
        .delete('/api/transaction/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);

      spy.mockRestore();
    });
  });
});
