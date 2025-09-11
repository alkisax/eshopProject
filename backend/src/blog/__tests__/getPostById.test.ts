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
let postId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-posts-getone',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-getone@example.com',
    name: 'Admin GetOne',
  });

  adminToken = jwt.sign(
    {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      roles: admin.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const subPage = await SubPage.create({ name: 'news' });
  subPageId = subPage._id.toString();

  const title = 'Get One Post';
  const post = await Post.create({
    title,
    slug: slugify(title),
    content: {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: 'ById' } }],
      version: '2.28.0',
    },
    subPage: subPageId,
    pinned: false,
  });
  postId = post._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/posts/:postId', () => {
  it('returns one post (200)', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(postId);
  });

  it('404 not found', async () => {
    const res = await request(app)
      .get('/api/posts/68ad7e285d9e6a24a76b249e')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .get('/api/posts/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws', async () => {
    const spy = jest
      .spyOn(postDAO, 'getPostById')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
