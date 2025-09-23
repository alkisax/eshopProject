// tests/user.addfavorite.test.ts
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
let commodityId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Create admin
  const hashedAdminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-favorites',
    hashedPassword: hashedAdminPassword,
    roles: ['ADMIN'],
    email: 'admin-favorites@example.com',
    name: 'Admin Fav',
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
    username: 'normal-fav-user',
    hashedPassword: hashedUserPassword,
    roles: ['USER'],
    email: 'normal-fav@example.com',
    name: 'Normal Fav User',
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

  // 🛒 Commodity
  const commodity = await Commodity.create({
    name: 'Fav Commodity',
    price: 42,
    currency: 'eur',
    stripePriceId: 'price_fav_test',
  });
  commodityId = commodity._id.toString();
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/users/:id/favorites (add)', () => {
  it('401 if no token', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .send({ commodityId });
    expect(res.status).toBe(401);
  });

  it('403 if wrong user and not admin', async () => {
    const stranger = await User.create({
      username: 'stranger-fav',
      hashedPassword: await bcrypt.hash('Passw0rd!', 10),
      roles: ['USER'],
      email: 'stranger-fav@example.com',
      name: 'Stranger Fav',
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
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ commodityId });

    expect(res.status).toBe(403);
  });

  it('400 if no commodityId provided', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/commodityId required/);
  });

  it('200 if self → adds favorite', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.favorites).toContain(commodityId);
  });

  it('200 if admin → adds favorite to other user', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.favorites).toContain(commodityId);
  });

  it('no duplicates when adding same commodity twice', async () => {
    await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    const favorites: string[] = res.body.data.favorites;
    expect(favorites.filter(id => id === commodityId).length).toBe(1);
  });
});

describe('DELETE /api/users/:id/favorites (remove)', () => {
  it('401 if no token', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .send({ commodityId });
    expect(res.status).toBe(401);
  });

  it('400 if no commodityId provided', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('200 removes favorite successfully', async () => {
    // Ensure it's there
    await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    const favorites: string[] = res.body.data.favorites;
    expect(favorites).not.toContain(commodityId);
  });
});

// 👀 SpyOn tests (separate describe)
describe('userDAO.update (spy)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls update once with favorites field', async () => {
    const spy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(userId),
      username: 'mock-user',
      roles: ['USER'],
      favorites: [commodityId],
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'mock@example.com',
      hashedPassword: 'hashed',
    } as any);

    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toHaveProperty('favorites');
  });

  it('handles DAO error gracefully', async () => {
    jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/DB fail/);
  });
});
