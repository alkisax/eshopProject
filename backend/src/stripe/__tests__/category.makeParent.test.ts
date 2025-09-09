// backend/test/categories/makeParent.test.ts
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
    username: 'admin-cat-makeparent',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-makeparent@example.com',
    name: 'Admin MakeParent',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  parentId = (await Category.create({ name: 'Computers', slug: 'computers' }))._id!.toString();
  childId = (await Category.create({ name: 'Desktops', slug: 'desktops' }))._id!.toString();
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('POST /api/category/make-parent', () => {
  it('401 without token', async () => {
    const res = await request(app).post('/api/category/make-parent').send({ parentId, childId });
    expect(res.status).toBe(401);
  });

  it('sets parent successfully (200)', async () => {
    const res = await request(app)
      .post('/api/category/make-parent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ parentId, childId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.parent).toBe(parentId);

    const parent = await Category.findById(parentId);
    expect(parent?.children?.map(String)).toContain(childId);
  });

  it('404 when parent missing', async () => {
    const missingParent = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/category/make-parent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ parentId: missingParent, childId });

    expect(res.status).toBe(404);
  });

  it('404 when child missing', async () => {
    const missingChild = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/category/make-parent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ parentId, childId: missingChild });

    expect(res.status).toBe(404);
  });

  it('initializes parent.children when undefined', async () => {
    // Create a parent with children unset
    const tempParent = await Category.create({ name: 'Laptops', slug: 'laptops' });
    const tempChild = await Category.create({ name: 'Gaming Laptops', slug: 'gaming-laptops' });

    // Force remove `children` so it’s undefined in Mongo
    await Category.updateOne({ _id: tempParent._id }, { $unset: { children: '' } });

    const res = await request(app)
      .post('/api/category/make-parent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ parentId: tempParent._id!.toString(), childId: tempChild._id!.toString() });

    expect(res.status).toBe(200);

    const updatedParent = await Category.findById(tempParent._id);
    expect(updatedParent?.children?.map(String)).toContain(tempChild._id!.toString());
  });
});