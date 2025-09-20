// backend/src/aiEmbedings/__tests__/gptEmbedingsSearch.test.ts
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Commodity from '../../stripe/models/commodity.models';
import * as gptService from '../gptEmbedingsService';
import { semanticSearchCommodities, cosineSimilarity } from '../gptEmbedingsService';
import type { CommodityType } from '../../stripe/types/stripe.types';

// --- Env guards ---
if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required for tests');
}

beforeAll(async () => {
  // console.log('🔌 Connecting to test DB:', process.env.MONGODB_TEST_URI);
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await Commodity.deleteMany({});
});

afterAll(async () => {
  // console.log('🧹 Cleaning up test DB and disconnecting');
  await Commodity.deleteMany({});
  await mongoose.disconnect();
});

afterEach(async () => {
  // console.log('🧼 Clearing commodities collection');
  await Commodity.deleteMany({});
  jest.restoreAllMocks();
});

// --- Fixtures ---
const fakeVector: number[] = [1, 0, 0];

const makeCommodity = async (overrides: Partial<CommodityType> = {}) => {
  const doc = new Commodity({
    name: 'Test Item',
    description: 'Just for testing',
    price: 100,
    currency: 'eur',
    stripePriceId: `price_${Date.now()}_${Math.random()}`,
    stock: 10,
    soldCount: 0,
    active: true,
    vector: fakeVector,
    ...overrides,
  });
  return await doc.save();
};

// --- Unit tests ---
describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2], [1, 2])).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('returns -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });
});

describe('semanticSearchCommodities (with real DAO)', () => {
  it('returns ranked commodities when DB has vectors', async () => {
    const c1 = await makeCommodity({ name: 'Red Ring', vector: [1, 0, 0] });
    await makeCommodity({ name: 'Blue Necklace', vector: [0, 1, 0] });

    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue([1, 0, 0]);

    const results = await semanticSearchCommodities('red', 2);

    expect(results).toHaveLength(2);
    expect(results[0].commodity._id.toString()).toEqual(c1._id.toString());
    expect(results[0].score).toBeGreaterThan(results[1].score);

    spy.mockRestore();
  });

  it('returns empty array if no commodities exist', async () => {
    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue([1, 0, 0]);

    const results = await semanticSearchCommodities('anything');
    expect(results).toEqual([]);

    spy.mockRestore();
  });

  it('throws if getEmbedding fails', async () => {
    await makeCommodity({ name: 'Should break' });

    const spy = jest.spyOn(gptService, 'getEmbedding').mockRejectedValue(new Error('Embedding API down'));

    await expect(semanticSearchCommodities('fail')).rejects.toThrow('Embedding API down');

    spy.mockRestore();
  });

  it('handles commodities missing vectors gracefully', async () => {
    await makeCommodity({ name: 'No vector', vector: [] });

    const spy = jest.spyOn(gptService, 'getEmbedding').mockResolvedValue([1, 0, 0]);

    const results = await semanticSearchCommodities('query');
    expect(results).toEqual([]);

    spy.mockRestore();
  });
});
