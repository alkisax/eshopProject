// backend/test/categories/toggleTag.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose, { connect, disconnect } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../../stripe/models/category.models';
import User from '../../login/models/users.models';

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');}
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');}

let adminToken = '';
let catId = 
beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-cat-toggle',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-toggle@example.com',
    name: 'Admin Toggle',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const doc = await Category.create({ name: 'Accessories', slug: 'accessories', isTag: false });
  catId = doc._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('PUT /api/category/:id/toggle-tag', () => {
  it('401 without token', async () => {
    const res = await request(app).put(`/api/category/${catId}/toggle-tag`);
    expect(res.status).toBe(401);
  });

  it('toggles isTag → true', async () => {
    const res = await request(app)
      .put(`/api/category/${catId}/toggle-tag`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.isTag).toBe(true);
  });

  it('toggles isTag back → false', async () => {
    const res = await request(app)
      .put(`/api/category/${catId}/toggle-tag`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isTag).toBe(false);
  });

  it('404 when category not found', async () => {
    const fake = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/category/${fake}/toggle-tag`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .put('/api/category/invalid-id/toggle-tag')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
  });
});
