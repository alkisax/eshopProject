// backend/test/subPage/createSubPage.test.ts
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

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');}
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');}

let adminToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-sub-create',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-create@example.com',
    name: 'Admin Create',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/subpage', () => {
  it('400 without name', async () => {
    const res = await request(app)
      .post('/api/subpage')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('201 creates subpage', async () => {
    const res = await request(app)
      .post('/api/subpage')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'to-create' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('to-create');
  });
});

describe('DAO errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO throws', async () => {
    const spy = jest.spyOn(subPageDao, 'createSubPage').mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .post('/api/subpage')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'fail-create' });

    expect(res.status).toBe(500);

    spy.mockRestore();
  });

  it('throws DatabaseError when SubPage.create fails', async () => {
    const spy = jest.spyOn(SubPage, 'create').mockImplementation(() => {
      throw new Error('Mongoose fail');
    });

    await expect(subPageDao.createSubPage('bad')).rejects.toThrow('Failed to create subpage: Mongoose fail');

    spy.mockRestore();
  });

});
