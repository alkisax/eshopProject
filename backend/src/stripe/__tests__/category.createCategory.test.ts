// backend/test/categories/createCategory.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../../stripe/models/category.models';
import User from '../../login/models/users.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
};
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
};

let adminToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-cat-create',
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
  await Category.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/category', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/category').send({ name: 'Cams', slug: 'cams' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when missing required fields', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'MissingSlug' });
    expect(res.status).toBe(400);
  });

  it('creates a category (201)', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cameras', slug: 'cameras', description: 'Photo gear' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.data.name).toBe('Cameras');
    expect(res.body.data.slug).toBe('cameras');
  });

  it('fails on duplicate unique slug (500)', async () => {
    // Same slug again
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cameras-dup', slug: 'cameras' });

    expect(res.status).toBe(500);
  });
});
