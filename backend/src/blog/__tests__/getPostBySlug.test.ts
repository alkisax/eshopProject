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
let postSlug = '';
let postId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});

  // Create admin
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-posts-getslug',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-getslug@example.com',
    name: 'Admin GetSlug',
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

  // Create subPage
  const subPage = await SubPage.create({ name: 'announcements' });
  subPageId = subPage._id.toString();

  // Create post
  const title = 'Slug Post Example';
  postSlug = slugify(title);
  const post = await Post.create({
    title,
    slug: postSlug,
    content: {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: 'Slug Test Content' } }],
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

describe('GET /api/posts/slug/:slug', () => {
  it('returns one post by slug (200)', async () => {
    const res = await request(app)
      .get(`/api/posts/slug/${postSlug}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(postSlug);
    expect(res.body.data._id).toBe(postId);
  });

  it('404 if slug not found', async () => {
    const res = await request(app)
      .get('/api/posts/slug/does-not-exist')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('handles slug with invalid format (still 404)', async () => {
    const res = await request(app)
      .get('/api/posts/slug/@@@')
      .set('Authorization', `Bearer ${adminToken}`);
    // Because findOne just returns null for invalid string → NotFound
    expect(res.status).toBe(404);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws', async () => {
    const spy = jest
      .spyOn(postDAO, 'getPostBySlug')
      .mockRejectedValue(new Error('DB fail'));

    const res = await request(app)
      .get(`/api/posts/slug/${postSlug}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it('wraps unexpected errors into DatabaseError', async () => {
    const spy = jest
      .spyOn(Post, 'findOne')
      .mockImplementationOnce(() => {
        throw new Error('Unexpected low-level error');
      });
    await expect(postDAO.getPostBySlug('any-slug')).rejects.toThrow(
      /Failed to fetch post by slug: Unexpected low-level error/
    );
    spy.mockRestore();
  });

});
