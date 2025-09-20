import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import Commodity from '../../stripe/models/commodity.models';
import * as gptService from '../gptEmbedingsService';
import type { CommodityType } from '../../stripe/types/stripe.types';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await Commodity.deleteMany({});
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await mongoose.disconnect();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// --- Controller tests ---
describe('GET /api/ai-embeddings/search', () => {
  it('400 if no query param is provided', async () => {
    const res = await request(app).get('/api/ai-embeddings/search');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/Missing query/i);
  });

  it('200 and returns results when semanticSearchCommodities succeeds', async () => {
    const fakeCommodity = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Ring',
      description: 'A test ring',
      category: ['Jewelry'],
      price: 100,
      currency: 'eur',
      stripePriceId: 'price_test',
      soldCount: 0,
      stock: 10,
      active: true,
      images: [],
      comments: [],
      vector: [0.1, 0.2],
    } as unknown as CommodityType;

    const fakeResults: { commodity: CommodityType; score: number }[] = [
      { commodity: fakeCommodity, score: 0.9 },
      { commodity: Object.assign({}, fakeCommodity, { name: 'Necklace' }) as CommodityType, score: 0.7 },
    ];

    const spy = jest
      .spyOn(gptService, 'semanticSearchCommodities')
      .mockResolvedValue(fakeResults);

    const res = await request(app).get('/api/ai-embeddings/search?query=ring');

    expect(spy).toHaveBeenCalledWith('ring', 5);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.length).toBe(2);

    spy.mockRestore();
  });


  it('500 if semanticSearchCommodities throws', async () => {
    const spy = jest
      .spyOn(gptService, 'semanticSearchCommodities')
      .mockRejectedValue(new Error('Embedding service down'));

    const res = await request(app).get('/api/ai-embeddings/search?query=fail');

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/Embedding service down/i);

    spy.mockRestore();
  });
});
