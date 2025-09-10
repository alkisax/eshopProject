// backend/test/categories/getAllCategories.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

import app from '../../app';
import Category from '../models/category.models';
import User from '../../login/models/users.models';
import { categoriesDao } from '../daos/category.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
};

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
};

// let adminToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await Category.deleteMany({});
  await User.deleteMany({});

  // const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  // const admin = await User.create({
  //   username: 'admin-cat-getall',
  //   hashedPassword,
  //   roles: ['ADMIN'],
  //   email: 'admin-getall@example.com',
  //   name: 'Admin GetAll',
  // });

  // adminToken = jwt.sign(
  //   { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
  //   process.env.JWT_SECRET!,
  //   { expiresIn: '1h' }
  // );

  const parent = await Category.create({ name: 'Electronics', slug: 'electronics' });
  await Category.create({ name: 'Laptops', slug: 'laptops', parent: parent._id });
});

afterAll(async () => {
  await Category.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

afterEach(async () => {
  await Category.deleteMany({});
});

describe('GET /api/category', () => {
  it('returns all categories (open endpoint)', async () => {
    const res = await request(app).get('/api/category');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const names = (res.body.data as Array<{ name: string }>).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Electronics', 'Laptops']));
  });


  it('returns empty list if no categories exist', async () => {
    const res = await request(app).get('/api/category');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('returns populated parent for child category', async () => {
    const parent = await Category.create({ name: 'Books', slug: 'books' });
    await Category.create({ name: 'Sci-Fi', slug: 'sci-fi', parent: parent._id });

    const res = await request(app).get('/api/category');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const sciFi = res.body.data.find((c: any) => c.slug === 'sci-fi');
    expect(sciFi?.parent).toBeDefined();
    expect(sciFi.parent.name).toBe('Books');
  });

  it('returns 500 if DAO fails', async () => {
    // ✅ Spy on the DAO (not Mongoose), and restore inside this test
    const spy = jest
      .spyOn(categoriesDao, 'getAllCategories')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app).get('/api/category');
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);

    spy.mockRestore();
  });
});
