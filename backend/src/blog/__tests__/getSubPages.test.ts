// backend/test/subPage/getSubPages.test.ts
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
import { slugify } from '../../blog/utils/slugify';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-sub-get',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-get@example.com',
    name: 'Admin Get',
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

  await SubPage.create({ name: 'news', slug: slugify('news') });
  await SubPage.create({ name: 'announcements', slug: slugify('announcements') });
});

afterAll(async () => {
  await User.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/subpage', () => {
  it('returns all subpages (200)', async () => {
    const res = await request(app)
      .get('/api/subpage')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('DAO errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO throws', async () => {
    const spy = jest
      .spyOn(subPageDao, 'getAllSubPages')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .get('/api/subpage')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);

    spy.mockRestore();
  });

  it('throws DatabaseError when SubPage.find fails', async () => {
    const spy = jest.spyOn(SubPage, 'find').mockImplementation(() => {
      throw new Error('Mongoose fail');
    });

    await expect(subPageDao.getAllSubPages()).rejects.toThrow(
      'Failed to fetch subpages: Mongoose fail'
    );

    spy.mockRestore();
  });
});
