// tests/commodity.comment.getAllByUser.test.ts
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
let userToken = '';
let userId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Create admin
  const hashedAdminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-comments-by-user',
    hashedPassword: hashedAdminPassword,
    roles: ['ADMIN'],
    email: 'admin-comments-by-user@example.com',
    name: 'Admin User',
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

  // 👤 Create normal user
  const hashedUserPassword = await bcrypt.hash('Passw0rd!', 10);
  const normalUser = await User.create({
    username: 'normal-user-comments',
    hashedPassword: hashedUserPassword,
    roles: ['USER'],
    email: 'normaluser@example.com',
    name: 'Normal User',
  });
  userId = normalUser._id.toString();

  userToken = jwt.sign(
    {
      id: normalUser._id.toString(),
      username: normalUser.username,
      email: normalUser.email,
      roles: normalUser.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 🛒 Commodity with comments from both users
  await Commodity.create({
    name: 'Product A',
    price: 20,
    currency: 'eur',
    stripePriceId: 'price_user_comments',
    comments: [
      {
        user: normalUser._id,
        text: 'User comment 1',
        rating: 5,
        isApproved: true,
      },
      {
        user: admin._id,
        text: 'Admin comment here',
        rating: 3,
        isApproved: false,
      },
    ],
  });
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/commodity/comments/user/:userId', () => {
  it('401 if no token', async () => {
    const res = await request(app).get(`/api/commodity/comments/user/${userId}`);
    expect(res.status).toBe(401);
  });

  it('403 if wrong user and not admin', async () => {
    // Create another random user
    const stranger = await User.create({
      username: 'stranger',
      hashedPassword: await bcrypt.hash('Passw0rd!', 10),
      roles: ['USER'],
      email: 'stranger@example.com',
      name: 'Stranger',
    });

    const strangerToken = jwt.sign(
      {
        id: stranger._id.toString(),
        username: stranger.username,
        email: stranger.email,
        roles: stranger.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    expect(res.status).toBe(403);
  });

  interface UserComment {
    text: string;
    rating?: number;
    isApproved: boolean;
    createdAt: string;
    commentId: string;
    commodityId: string;
    commodityName: string;
  }

  it('200 if self → returns own comments', async () => {
    const res = await request(app)
      .get(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const data: UserComment[] = res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.some(c => c.text === 'User comment 1')).toBe(true);
  });

  it('200 if admin → returns comments of user', async () => {
    const res = await request(app)
      .get(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const data: UserComment[] = res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.some(c => c.text === 'User comment 1')).toBe(true);
  });

  it('200 with empty array if user has no comments', async () => {
    const otherUser = await User.create({
      username: 'other-user',
      hashedPassword: await bcrypt.hash('Passw0rd!', 10),
      roles: ['USER'],
      email: 'other@example.com',
      name: 'Other User',
    });
    const otherToken = jwt.sign(
      {
        id: otherUser._id.toString(),
        username: otherUser.username,
        email: otherUser.email,
        roles: otherUser.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get(`/api/commodity/comments/user/${otherUser._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

// 👀 SpyOn tests (separate describe)
describe('commodityDAO.getCommentsByUser (spy)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls aggregate once with correct match', async () => {
    const spy = jest.spyOn(Commodity, 'aggregate').mockResolvedValueOnce([]);
    await request(app)
      .get(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ $match: expect.any(Object) }),
      ])
    );
  });

  it('handles DAO error gracefully', async () => {
    jest.spyOn(Commodity, 'aggregate').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .get(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/DB fail/);
  });
});
