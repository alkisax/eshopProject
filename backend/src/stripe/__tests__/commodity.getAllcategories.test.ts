// backend/src/commodity/__tests__/commodity.categories.test.ts

// ✅ Prevent real Stripe calls
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    charges: { create: jest.fn().mockResolvedValue({ success: true }) }
  }));
});

import request from 'supertest';
import mongoose, { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../../app';
import Commodity from '../models/commodity.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI environment variable is required');
}

describe('Commodity Controller - getAllCategories', () => {
  beforeAll(async () => {
    await connect(process.env.MONGODB_TEST_URI!);
  });

  afterAll(async () => {
    await Commodity.deleteMany({});
    await disconnect();
  });

  beforeEach(async () => {
    await Commodity.deleteMany({});
  });

  it('should return all unique categories from commodities', async () => {
    await Commodity.create({
      name: 'Phone',
      description: 'Smartphone',
      category: ['Electronics'],
      price: 500,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}a`,
      stock: 10
    });

    await Commodity.create({
      name: 'Book',
      description: 'Fiction',
      category: ['Books'],
      price: 20,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}b`,
      stock: 50
    });

    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining(['Electronics', 'Books'])
    );
  });

  it('should return an empty array if no commodities exist', async () => {
    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should not return duplicate categories', async () => {
    await Commodity.create({
      name: 'Phone',
      description: 'Smartphone',
      category: ['Electronics'],
      price: 500,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}c`,
      stock: 10
    });

    await Commodity.create({
      name: 'Laptop',
      description: 'Gaming',
      category: ['Electronics'], // duplicate category
      price: 1200,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}d`,
      stock: 5
    });

    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual(['Electronics']); // only one unique
  });
});

describe('more test with mock unhappy path', () => {
  beforeAll(async () => {
    // ensure DB is connected for this block
    if (mongoose.connection.readyState === 0) {
      await connect(process.env.MONGODB_TEST_URI!);
    }
  });

  beforeEach(async () => {
    await Commodity.deleteMany({});
  });

  afterAll(async () => {
    await Commodity.deleteMany({});
    await disconnect();
  });

  it('should ignore empty string categories', async () => {
    await Commodity.create({
      name: 'Broken Commodity',
      description: 'Has empty category',
      category: [''],
      price: 1,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}e`,
      stock: 1,
    });

    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should flatten multiple categories per commodity', async () => {
    await Commodity.create({
      name: 'Combo Item',
      description: 'Belongs to 2 categories',
      category: ['Books', 'Toys'],
      price: 10,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}f`,
      stock: 3,
    });

    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining(['Books', 'Toys']));
  });

  it('should return categories sorted alphabetically', async () => {
    await Commodity.create({
      name: 'Item1',
      description: 'Category C',
      category: ['Zebra'],
      price: 1,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}g`,
      stock: 1,
    });

    await Commodity.create({
      name: 'Item2',
      description: 'Category A',
      category: ['Apple'],
      price: 1,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}h`,
      stock: 1,
    });

    const res = await request(app).get('/api/commodity/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual(['Apple', 'Zebra']);
  });
});
