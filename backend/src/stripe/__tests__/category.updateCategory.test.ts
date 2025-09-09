// backend/test/categories/updateCategory.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose, { connect, disconnect } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../../stripe/models/category.models';
import User from '../../login/models/users.models';

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');;}
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');};

let adminToken = '';
let catId = '';

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-cat-update',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-update@example.com',
    name: 'Admin Update',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const doc = await Category.create({ name: 'Consoles', slug: 'consoles' });
  catId = doc._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('PATCH /api/category/:id', () => {
  it('401 without token', async () => {
    const res = await request(app).patch(`/api/category/${catId}`).send({ name: 'Game Consoles' });
    expect(res.status).toBe(401);
  });

  it('updates a category (200)', async () => {
    const res = await request(app)
      .patch(`/api/category/${catId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Game Consoles', slug: 'game-consoles' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.name).toBe('Game Consoles');
    expect(res.body.data.slug).toBe('game-consoles');
  });

  it('404 when updating non-existing id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/api/category/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nothing' });

    expect(res.status).toBe(404);
  });

  it('500 when invalid id format', async () => {
    const res = await request(app)
      .patch('/api/category/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nope' });

    expect(res.status).toBe(500);
  });
});
