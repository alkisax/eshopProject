import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../../stripe/models/commodity.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
// let commodityId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Create admin
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-commodity-comments',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-comments@example.com',
    name: 'Admin Commodity',
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

  // 🛒 Create a commodity with some comments
  await Commodity.create({
    name: 'Test Product',
    price: 10,
    currency: 'eur',
    stripePriceId: 'price_123',
    comments: [
      {
        user: admin._id,
        text: 'Nice!',
        rating: 4,
        isApproved: true,
      },
      {
        user: admin._id,
        text: 'Could be better',
        rating: 2,
        isApproved: false,
      },
    ],
  });

  // commodityId = doc._id.toString();
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/commodity/comments', () => {
  it('401 without token', async () => {
    const res = await request(app).get('/api/commodity/comments');
    expect(res.status).toBe(401);
  });

  it('403 with non-admin token', async () => {
    const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
    const user = await User.create({
      username: 'normal-user',
      hashedPassword,
      roles: ['USER'],
      email: 'user@example.com',
      name: 'Normal User',
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
      .get('/api/commodity/comments')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('200 returns all comments with commodity info', async () => {
    const res = await request(app)
      .get('/api/commodity/comments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const data = res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);

    const c = data[0];
    expect(c).toHaveProperty('commodity');
    expect(c.commodity).toHaveProperty('_id');
    expect(c.commodity).toHaveProperty('name');
    expect(c).toHaveProperty('text');
    expect(c).toHaveProperty('rating');
    expect(c).toHaveProperty('isApproved');
    expect(c).toHaveProperty('createdAt');
    expect(c).toHaveProperty('commentId');
  });

  it('200 returns empty array if no comments', async () => {
    await Commodity.deleteMany({});
    await Commodity.create({
      name: 'Empty Product',
      price: 5,
      currency: 'eur',
      stripePriceId: 'price_empty',
    });

    const res = await request(app)
      .get('/api/commodity/comments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

// 👀 Extra spyOn tests for DAO
describe('commodityDAO.getAllComments (spy)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call aggregate once on Commodity', async () => {
    const spy = jest.spyOn(Commodity, 'aggregate').mockResolvedValueOnce([]);
    await request(app)
      .get('/api/commodity/comments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle DAO error gracefully', async () => {
    jest.spyOn(Commodity, 'aggregate').mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app)
      .get('/api/commodity/comments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/DB fail/);
  });
});
