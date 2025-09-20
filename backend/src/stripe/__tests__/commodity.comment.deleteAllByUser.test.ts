// tests/commodity.comment.deleteAllByUser.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../models/commodity.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
};
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
};

let adminToken = '';
let userToken = '';
let userId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Admin
  const hashedAdminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-delete-user-comments',
    hashedPassword: hashedAdminPassword,
    roles: ['ADMIN'],
    email: 'admin-delete@example.com',
    name: 'Admin User',
  });
  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 👤 Normal user
  const hashedUserPassword = await bcrypt.hash('Passw0rd!', 10);
  const normalUser = await User.create({
    username: 'normal-delete-user-comments',
    hashedPassword: hashedUserPassword,
    roles: ['USER'],
    email: 'normal-delete@example.com',
    name: 'Normal User',
  });
  userId = normalUser._id.toString();
  userToken = jwt.sign(
    { id: normalUser._id.toString(), username: normalUser.username, roles: normalUser.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // Commodity with comments
  await Commodity.create({
    name: 'Delete Test Product',
    price: 50,
    currency: 'eur',
    stripePriceId: 'price_delete_test',
    comments: [
      { user: normalUser._id, text: 'Comment to delete', rating: 4, isApproved: true },
      { user: admin._id, text: 'Admin comment (kept)', rating: 2, isApproved: true },
    ],
  });
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/commodity/comments/user/:userId', () => {
  it('401 if no token', async () => {
    const res = await request(app).delete(`/api/commodity/comments/user/${userId}`);
    expect(res.status).toBe(401);
  });

  it('403 if wrong user and not admin', async () => {
    const stranger = await User.create({
      username: 'stranger-delete',
      hashedPassword: await bcrypt.hash('Passw0rd!', 10),
      roles: ['USER'],
      email: 'stranger-delete@example.com',
      name: 'Stranger',
    });
    const strangerToken = jwt.sign(
      { id: stranger._id.toString(), username: stranger.username, roles: stranger.roles },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    expect(res.status).toBe(403);
  });

  it('200 if self → deletes own comments', async () => {
    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/comments removed/);

    const commodity = await Commodity.findOne({ stripePriceId: 'price_delete_test' });
    expect((commodity?.comments ?? []).some(c => c.user.toString() === userId)).toBe(false);
  });

  it('200 if admin → deletes comments of user', async () => {
    // re-add comment for normalUser
    await Commodity.updateOne(
      { stripePriceId: 'price_delete_test' },
      { $push: { comments: { user: userId, text: 'Another comment', rating: 5, isApproved: true } } }
    );

    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/comments removed/);

    const commodity = await Commodity.findOne({ stripePriceId: 'price_delete_test' });
    expect((commodity?.comments ?? []).some(c => c.user.toString() === userId)).toBe(false);
  });

  it('200 and zero removed if user has no comments', async () => {
    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/comments removed/);
  });
});

// 👀 SpyOn tests
describe('commodityDAO.deleteAllCommentsByUser (spy)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls updateMany with $pull', async () => {
    const spy = jest.spyOn(Commodity, 'updateMany').mockResolvedValueOnce({ modifiedCount: 3 } as any);
    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toEqual({ $pull: { comments: { user: userId } } });
    expect(res.status).toBe(200);
  });

  it('handles DAO error gracefully', async () => {
    jest.spyOn(Commodity, 'updateMany').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .delete(`/api/commodity/comments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/DB fail/);
  });
});
