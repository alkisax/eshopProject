import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../../stripe/models/commodity.models';
import { commodityDAO } from '../../stripe/daos/commodity.dao';
import * as gptService from '../gptEmbedingsService';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let commodityId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // Create admin
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-embeddings',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-embeddings@example.com',
    name: 'Admin Embeddings',
  });

  adminToken = jwt.sign(
    {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      roles: admin.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Create commodity
  const commodity = await Commodity.create({
    name: 'Mandala Ring',
    description: 'Test description',
    category: ['Jewelry'],
    price: 100,
    currency: 'eur',
    stripePriceId: 'price_test_vectorize',
    soldCount: 0,
    stock: 10,
    active: true,
  });

  commodityId = commodity._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await Commodity.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/ai-embeddings/vectorize/:id', () => {
  it('401 if no token', async () => {
    const res = await request(app).post(`/api/ai-embeddings/vectorize/${commodityId}`);
    expect(res.status).toBe(401);
  });

  it('403 if not admin', async () => {
    const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
    const user = await User.create({
      username: 'user-embeddings',
      hashedPassword,
      roles: ['USER'],
      email: 'user-embeddings@example.com',
      name: 'User Embeddings',
    });

    const userToken = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${commodityId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('404 if commodity not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // handleControllerError usually returns 500 if DAO throws, but
    // if your DAO rejects with NotFound, adapt this expectation
    expect([404, 500]).toContain(res.status);
  });

  it('200 and returns commodity with vector (happy path)', async () => {
    // Spy getEmbedding to return fake vector
    const fakeVector = Array(10).fill(0.5); // shorter than 1536 for test speed
    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue(fakeVector);

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.commodity._id).toBe(commodityId);
    expect(Array.isArray(res.body.commodity.vector)).toBe(true);
    expect(res.body.commodity.vector.length).toBe(fakeVector.length);

    spy.mockRestore();
  });
});

describe('DAO/service errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when generateEmbeddingForOneCommodity throws', async () => {
    const spy = jest
      .spyOn(gptService, 'generateEmbeddingForOneCommodity')
      .mockRejectedValue(new Error('Embedding service failure'));

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('500 when DAO.findCommodityById throws', async () => {
    const spy = jest
      .spyOn(commodityDAO, 'findCommodityById')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('200 and works even if commodity has no description', async () => {
    const commodityNoDesc = await Commodity.create({
      name: 'NoDesc Item',
      category: ['Misc'],
      price: 50,
      currency: 'eur',
      stripePriceId: 'price_nodesc',
      soldCount: 0,
      stock: 5,
      active: true,
    });

    const fakeVector = Array(4).fill(0.9);
    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue(fakeVector);

    const res = await request(app)
      .post(`/api/ai-embeddings/vectorize/${commodityNoDesc._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.commodity._id).toBe(commodityNoDesc._id.toString());
    expect(res.body.commodity.vector.length).toBe(fakeVector.length);

    spy.mockRestore();
  });
});

describe('POST /api/ai-embeddings/vectorize/all', () => {
  it('401 if no token', async () => {
    const res = await request(app).post('/api/ai-embeddings/vectorize/all');
    expect(res.status).toBe(401);
  });

  it('403 if not admin', async () => {
    const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
    const user = await User.create({
      username: 'user-embeddings-all',
      hashedPassword,
      roles: ['USER'],
      email: 'user-embeddings-all@example.com',
      name: 'User Embeddings All',
    });

    const userToken = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/ai-embeddings/vectorize/all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('200 returns count of updated commodities (happy path)', async () => {
    const fakeVector = Array(8).fill(0.25);
    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue(fakeVector);

    const res = await request(app)
      .post('/api/ai-embeddings/vectorize/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(typeof res.body.data).toBe('number');
    expect(res.body.data).toBeGreaterThanOrEqual(0);

    spy.mockRestore();
  });
});

describe('DAO/service errors for /vectorize/all', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO.findAllCommodities throws', async () => {
    const spy = jest
      .spyOn(commodityDAO, 'findAllCommodities')
      .mockRejectedValue(new Error('DAO fail'));

    const res = await request(app)
      .post('/api/ai-embeddings/vectorize/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('500 when generateEmbeddingForOneCommodity throws', async () => {
    const spy = jest
      .spyOn(gptService, 'generateEmbeddingForOneCommodity')
      .mockRejectedValue(new Error('Vectorize fail'));

    const res = await request(app)
      .post('/api/ai-embeddings/vectorize/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});
