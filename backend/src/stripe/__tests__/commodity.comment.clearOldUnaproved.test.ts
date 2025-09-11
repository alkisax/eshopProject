// src/stripe/__tests__/commodity.comment.clearOldUnaproved.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../../stripe/models/commodity.models';
import { commodityController } from '../../stripe/controllers/commodity.controller';
import { commodityDAO } from '../../stripe/daos/commodity.dao';
import type { Request, Response } from 'express';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let userToken = '';
let commodityId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Admin
  const hashedPasswordAdmin = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-clear-comments',
    hashedPassword: hashedPasswordAdmin,
    roles: ['ADMIN'],
    email: 'admin-clear@example.com',
    name: 'Admin Clear',
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

  // 👤 USER (non-admin)
  const hashedPasswordUser = await bcrypt.hash('Passw0rd!', 10);
  const user = await User.create({
    username: 'user-clear-comments',
    hashedPassword: hashedPasswordUser,
    roles: ['USER'],
    email: 'user-clear@example.com',
    name: 'Normal User',
  });

  userToken = jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 🛒 Commodity with three comments
  const commodity = await Commodity.create({
    name: 'Clear Product',
    price: 10,
    currency: 'eur',
    stripePriceId: 'price_clear',
    comments: [
      { user: admin._id, text: 'Old unapproved', rating: 1, isApproved: false },
      { user: admin._id, text: 'Fresh unapproved', rating: 2, isApproved: false },
      { user: admin._id, text: 'Approved comment', rating: 5, isApproved: true },
    ],
  });

  commodityId = commodity._id.toString();

  // ⚠️ Backdate *with native update* to bypass Mongoose subdocument timestamps override
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  await Commodity.collection.updateOne(
    { _id: commodity._id, 'comments.text': 'Old unapproved' },
    { $set: { 'comments.$.updatedAt': tenDaysAgo } }
  );

  // ✅ Assert precondition: the old unapproved comment is actually older than 5 days
  const reloaded = await Commodity.findById(commodity._id).lean();
  const old = reloaded?.comments?.find((c: any) => c.text === 'Old unapproved');
  if (!old || !old.updatedAt) {
    throw new Error('Failed to backdate comment in seed');
  }
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  if (!(new Date(old.updatedAt) < fiveDaysAgo)) {
    throw new Error('Backdated comment is not older than 5 days; seeding failed');
  }
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/commodity/comments/clear/old-unapproved', () => {
  it('401 without token', async () => {
    const res = await request(app)
      .delete('/api/commodity/comments/clear/old-unapproved');

    expect(res.status).toBe(401);
  });

  it('403 with non-admin token', async () => {
    const res = await request(app)
      .delete('/api/commodity/comments/clear/old-unapproved')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('200 with admin token (deletes old unapproved only)', async () => {
    const res = await request(app)
      .delete('/api/commodity/comments/clear/old-unapproved')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/unapproved comments older than 5 days/);

    // ✅ Validate in DB
    const commodity = await Commodity.findById(commodityId).lean();
    const texts = (commodity?.comments ?? []).map((c: any) => c.text);
    expect(texts).toContain('Fresh unapproved');
    expect(texts).toContain('Approved comment');
    expect(texts).not.toContain('Old unapproved'); // ← the one we backdated
  });

  it('200 when nothing to delete (returns 0)', async () => {
    const res = await request(app)
      .delete('/api/commodity/comments/clear/old-unapproved')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/^0 unapproved/);
  });
});

describe('commodityController.deleteOldUnapprovedComments validation (spy)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls DAO and returns 200 with message', async () => {
    const spy = jest.spyOn(commodityDAO, 'deleteOldUnapprovedComments')
      .mockResolvedValueOnce(3);

    await commodityController.deleteOldUnapprovedComments(
      req as Request,
      res as Response
    );

    expect(spy).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: '3 unapproved comments older than 5 days were deleted.',
    });
  });

  it('handles DAO error gracefully', async () => {
    const spy = jest.spyOn(commodityDAO, 'deleteOldUnapprovedComments')
      .mockRejectedValueOnce(new Error('DAO failure'));

    await commodityController.deleteOldUnapprovedComments(
      req as Request,
      res as Response
    );

    expect(spy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
