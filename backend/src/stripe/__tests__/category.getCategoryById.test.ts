// backend/test/categories/getCategoryById.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose, { connect, disconnect } from 'mongoose';

import app from '../../app';
import Category from '../../stripe/models/category.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
};

let createdId = '';

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  const doc = await Category.create({ name: 'Phones', slug: 'phones' });
  createdId = doc._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await disconnect();
});

describe('GET /api/category/:id', () => {
  it('returns 200 with the category', async () => {
    const res = await request(app).get(`/api/category/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.name).toBe('Phones');
  });

  it('returns 404 for non-existing valid ObjectId', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/category/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(false);
  });

  it('returns 500 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/category/not-an-id');
    expect(res.status).toBe(500);
  });
});
