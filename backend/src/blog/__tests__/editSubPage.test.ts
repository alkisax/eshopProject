// backend/test/subPage/editSubPage.test.ts
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
let subPageId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-sub-edit',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-edit@example.com',
    name: 'Admin Edit',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const subPage = await SubPage.create({ name: 'before-edit' });
  subPageId = subPage._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('PUT /api/subpage/:id', () => {
  it('400 no name', async () => {
    const res = await request(app)
      .put(`/api/subpage/${subPageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('200 edits subpage', async () => {
    const res = await request(app)
      .put(`/api/subpage/${subPageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'after-edit' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('after-edit');
  });

  it('404 not found', async () => {
    const res = await request(app)
      .put('/api/subpage/68ad7e285d9e6a24a76b249e')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'fail' });
    expect(res.status).toBe(404);
  });

  it('500 invalid id', async () => {
    const res = await request(app)
      .put('/api/subpage/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'fail' });
    expect(res.status).toBe(500);
  });
});

describe('DAO errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO throws', async () => {
    const spy = jest.spyOn(subPageDao, 'editSubPage').mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .put(`/api/subpage/${subPageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'spy-fail' });

    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});
