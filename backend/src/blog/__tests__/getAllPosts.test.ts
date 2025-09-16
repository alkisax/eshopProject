import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Post from '../../blog/models/post.model';
import SubPage from '../../blog/models/subPage.model';
import { postDAO } from '../../blog/daos/post.dao';
import { slugify } from '../../blog/utils/slugify';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let subPageId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-posts-get',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-get@example.com',
    name: 'Admin Get',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const subPage = await SubPage.create({ name: 'news' });
  subPageId = subPage._id.toString();

  const title = 'Hello World';
  await Post.create({
    title,
    slug: slugify(title),
    content: {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: 'Hello' } }],
      version: '2.28.0',
    },
    subPage: subPageId,
    pinned: false,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/posts', () => {
  it('returns posts (200)', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws directly', async () => {
    const spy = jest
      .spyOn(postDAO, 'getAllPosts')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it('500 when Mongoose find fails (triggers DAO catch)', async () => {
    const spy = jest.spyOn(Post, 'find').mockImplementation(() => {
      throw new Error('Mongoose fail');
    });

    await expect(postDAO.getAllPosts()).rejects.toThrow(
      'Failed to fetch posts: Mongoose fail'
    );

    spy.mockRestore();
  });
});
