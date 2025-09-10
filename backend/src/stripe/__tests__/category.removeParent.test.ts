// backend/test/categories/removeParent.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose, { connect, disconnect } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../../stripe/models/category.models';
import User from '../../login/models/users.models';

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');};
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');};

let adminToken = '';
let parentId = '';
let childId = '';

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-cat-removeparent',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-removeparent@example.com',
    name: 'Admin RemoveParent',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const parent = await Category.create({ name: 'Audio', slug: 'audio' });
  const child = await Category.create({ name: 'Speakers', slug: 'speakers', parent: parent._id });

  // keep both in sync like DAO would
  await Category.findByIdAndUpdate(parent._id, { $push: { children: child._id } });

  parentId = parent._id!.toString();
  childId = child._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('PUT /api/category/:id/remove-parent', () => {
  it('401 without token', async () => {
    const res = await request(app).put(`/api/category/${childId}/remove-parent`);
    expect(res.status).toBe(401);
  });

  it('removes parent successfully (200)', async () => {
    const res = await request(app)
      .put(`/api/category/${childId}/remove-parent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.parent).toBeUndefined();

    const parent = await Category.findById(parentId);
    const childInParent = parent?.children?.map(String).includes(childId);
    expect(childInParent).toBe(false);
  });

  it('404 when child not found', async () => {
    const fakeChild = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/category/${fakeChild}/remove-parent`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .put('/api/category/not-an-id/remove-parent')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
  });
});
