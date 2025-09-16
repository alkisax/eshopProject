// backend/test/subPage/deleteSubPage.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import SubPage from '../../blog/models/subPage.model';
import { subPageDao } from '../../blog/daos/subPage.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
};
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
};

let adminToken = '';
let subPageId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-sub-del',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-del@example.com',
    name: 'Admin Del',
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

  const subPage = await SubPage.create({
    name: 'to-delete',
    slug: 'to-delete',
    description: 'temporary subpage',
  });
  subPageId = subPage._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/subpage/:id', () => {
  it('200 deletes subpage', async () => {
    const res = await request(app)
      .delete(`/api/subpage/${subPageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('404 when already deleted', async () => {
    const res = await request(app)
      .delete(`/api/subpage/${subPageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('500 when invalid id', async () => {
    const res = await request(app)
      .delete('/api/subpage/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });
});

describe('DAO errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO throws', async () => {
    const spy = jest
      .spyOn(subPageDao, 'deleteSubPage')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .delete(`/api/subpage/${new mongoose.Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});
