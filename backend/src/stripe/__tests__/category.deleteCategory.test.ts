// backend/test/categories/deleteCategory.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../../stripe/models/category.models';
import User from '../../login/models/users.models';

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');}
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');}

let adminToken = '';
let catId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-cat-del',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-del@example.com',
    name: 'Admin Del',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const doc = await Category.create({ name: 'Headphones', slug: 'headphones' });
  catId = doc._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('DELETE /api/category/:id', () => {
  it('401 without token', async () => {
    const res = await request(app).delete(`/api/category/${catId}`);
    expect(res.status).toBe(401);
  });

  it('deletes a category (200)', async () => {
    const res = await request(app)
      .delete(`/api/category/${catId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  it('404 when category already deleted', async () => {
    const res = await request(app)
      .delete(`/api/category/${catId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .delete('/api/category/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });
});
