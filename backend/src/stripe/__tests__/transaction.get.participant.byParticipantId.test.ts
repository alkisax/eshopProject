import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import app from '../../app';

import User from '../../login/models/users.models';
import Participant from '../models/participant.models';
import Transaction from '../models/transaction.models';
import Commodity from '../models/commodity.models';

import type { Types } from 'mongoose';
import type { CommodityType } from '../types/stripe.types';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}

type LoginResponse = {
  status: boolean;
  data: {
    token: string;
  };
};

type ApiListResponse<T> = {
  status: boolean;
  data: T;
};

type TxItemPopulated = {
  commodity: CommodityType;
  quantity: number;
  priceAtPurchase: number;
};

type TxDoc = {
  _id: Types.ObjectId;
  participant: Types.ObjectId | string;
  items: TxItemPopulated[];
  amount: number;
  processed: boolean;
  cancelled: boolean;
  sessionId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/**
 * ⚠️ ΣΗΜΑΝΤΙΚΟ
 * Το endpoint /transaction/participant/:id είναι ADMIN-only.
 * Άρα το test user ΠΡΕΠΕΙ να είναι ADMIN.
 */
const TEST_USER = {
  username: 'testuser_tx',
  name: 'Test User',
  email: 'tx_user@example.com',
  password: 'supersecret',
  roles: ['ADMIN'], // ✅ FIX: ADMIN instead of USER
};

let token: string;
let userId: Types.ObjectId;
let participantId: Types.ObjectId;
let commodityId: Types.ObjectId;

describe('GET /api/transaction/participant/:participantId (ADMIN)', () => {
  beforeAll(async () => {
    await connect(process.env.MONGODB_TEST_URI!);

    // Clean slate
    await Promise.all([
      User.deleteMany({}),
      Participant.deleteMany({}),
      Transaction.deleteMany({}),
      Commodity.deleteMany({}),
    ]);

    // Create admin user
    const hashedPassword = await hash(TEST_USER.password, 10);
    const user = await User.create({
      username: TEST_USER.username,
      name: TEST_USER.name,
      email: TEST_USER.email,
      hashedPassword,
      roles: TEST_USER.roles,
    });
    userId = user._id;

    // Login to get JWT
    const loginRes = await request(app)
      .post('/api/auth')
      .send({ username: TEST_USER.username, password: TEST_USER.password });

    expect(loginRes.status).toBe(200);

    const loginBody = loginRes.body as LoginResponse;
    token = loginBody.data.token;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    // Create participant linked to this user
    const participant = await Participant.create({
      name: 'Buyer One',
      surname: 'Tester',
      email: 'buyer1@example.com',
      user: userId,
      transactions: [],
    });
    participantId = participant._id;

    // Create commodity
    const commodity = await Commodity.create({
      name: 'Demo Product',
      description: 'For tx tests',
      category: ['test'],
      price: 5,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}`,
      soldCount: 0,
      stock: 50,
      active: true,
      images: [],
    });
    commodityId = commodity._id;

    // Create first transaction
    await Transaction.create({
      participant: participantId,
      items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 5 }],
      amount: 5,
      processed: false,
      cancelled: false,
      sessionId: `cs_${Date.now()}_a`,
    });

    // ensure different createdAt
    await new Promise((r) => setTimeout(r, 10));

    // Create second transaction (newer)
    await Transaction.create({
      participant: participantId,
      items: [{ commodity: commodityId, quantity: 2, priceAtPurchase: 5 }],
      amount: 10,
      processed: false,
      cancelled: false,
      sessionId: `cs_${Date.now()}_b`,
    });
  }, 30000);

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      Participant.deleteMany({}),
      Transaction.deleteMany({}),
      Commodity.deleteMany({}),
    ]);
    await disconnect();
  });

  it('returns transactions for the participant (sorted desc, populated items.commodity)', async () => {
    const res = await request(app)
      .get(`/api/transaction/participant/${participantId.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const body = res.body as ApiListResponse<TxDoc[]>;
    expect(body.status).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(2);

    const [first, second] = body.data;

    // Sorted DESC by createdAt
    expect(first.amount).toBe(10);
    expect(second.amount).toBe(5);

    const firstCreated = new Date(first.createdAt).getTime();
    const secondCreated = new Date(second.createdAt).getTime();
    expect(firstCreated).toBeGreaterThanOrEqual(secondCreated);

    // populated commodity checks
    expect(first.items.length).toBe(1);
    expect(first.items[0].commodity).toBeDefined();
    expect(first.items[0].commodity._id.toString()).toBe(
      commodityId.toString()
    );
    expect(first.items[0].commodity.name).toBe('Demo Product');
    expect(first.items[0].commodity.price).toBe(5);
    expect(first.items[0].commodity.currency).toBe('eur');
  });

  it('returns empty list for participant with no transactions', async () => {
    const emptyParticipant = await Participant.create({
      name: 'NoTx',
      email: 'no-tx@example.com',
      user: userId,
      transactions: [],
    });

    const res = await request(app)
      .get(`/api/transaction/participant/${emptyParticipant._id.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const body = res.body as ApiListResponse<TxDoc[]>;
    expect(body.status).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });
});
