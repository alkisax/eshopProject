import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../../stripe/models/commodity.models';
// import { CommodityType } from '../types/stripe.types';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let commodityId = '';
let commentIdApproved = '';
let commentIdUnapproved = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Create admin
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-update-comment',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-update@example.com',
    name: 'Admin Update',
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

  // 🛒 Commodity with comments
  const commodity = await Commodity.create({
    name: 'Toggle Product',
    price: 15,
    currency: 'eur',
    stripePriceId: 'price_toggle',
    comments: [
      {
        user: admin._id,
        text: 'Approved comment',
        rating: 5,
        isApproved: true,
      },
      {
        user: admin._id,
        text: 'Unapproved comment',
        rating: 1,
        isApproved: false,
      },
    ],
  });

  if (!commodity.comments || commodity.comments.length < 2) {
    throw new Error('Seeded commodity missing comments');
  }

  commodityId = commodity._id.toString();
  commentIdApproved = commodity.comments![0]._id!.toString();
  commentIdUnapproved = commodity.comments![1]._id!.toString();
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('PATCH /api/commodity/:commodityId/comments/:commentId', () => {
  it('401 without token', async () => {
    const res = await request(app).patch(
      `/api/commodity/${commodityId}/comments/${commentIdApproved}`
    ).send({ isApproved: false });

    expect(res.status).toBe(401);
  });

  it('403 with non-admin token', async () => {
    const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
    const user = await User.create({
      username: 'user-toggle',
      hashedPassword,
      roles: ['USER'],
      email: 'user-toggle@example.com',
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
      .patch(`/api/commodity/${commodityId}/comments/${commentIdApproved}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isApproved: false });

    expect(res.status).toBe(403);
  });

  it('400 if commodityId missing', async () => {
    const res = await request(app)
      .patch(`/api/commodity//comments/${commentIdApproved}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: false });

    expect(res.status).toBe(404); // Express route not found
  });

  it('400 if commentId missing', async () => {
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}/comments/`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: false });

    expect([400, 404]).toContain(res.status);
  });

  it('200 toggles approved -> false', async () => {
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}/comments/${commentIdApproved}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: false });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const updated = res.body.data;
    const updatedComment = updated.comments.find(
      (c: { _id: string }) => c._id === commentIdApproved
    );
    expect(updatedComment.isApproved).toBe(false);
  });

  it('200 toggles unapproved -> true', async () => {
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}/comments/${commentIdUnapproved}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: true });

    expect(res.status).toBe(200);
    const updatedComment = res.body.data.comments.find(
      (c: { _id: string }) => c._id === commentIdUnapproved
    );
    expect(updatedComment.isApproved).toBe(true);
  });

  it('404 if commodity not found', async () => {
    const fakeCommodityId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/api/commodity/${fakeCommodityId}/comments/${commentIdApproved}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: false });

    expect(res.status).toBe(404);
  });

  it('404 if comment not found', async () => {
    const fakeCommentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}/comments/${fakeCommentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isApproved: false });

    expect(res.status).toBe(404);
  });
});


import { Request, Response } from 'express';
import { commodityController } from '../../stripe/controllers/commodity.controller';
import { commodityDAO } from '../../stripe/daos/commodity.dao';

describe('commodityController.updateComment validation (spy)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},   // 👈 no commodityId or commentId
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 400 if commodityId or commentId is missing', async () => {
    const spy = jest.spyOn(commodityDAO, 'updateCommentInCommodity');

    // Cast to proper types when passing to controller
    await commodityController.updateComment(
      req as Request,
      res as Response
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Commodity ID and Comment ID are required',
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
