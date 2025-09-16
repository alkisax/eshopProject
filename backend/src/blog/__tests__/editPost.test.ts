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
    username: 'admin-posts-edit',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin-edit@example.com',
    name: 'Admin Edit',
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), username: admin.username, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const subPage = await SubPage.create({ name: 'announcements' });
  subPageId = subPage._id.toString();

  const title = 'Before Edit';
  const post = await Post.create({
    title,
    slug: slugify(title),
    content: {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: 'Before Edit' } }],
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

describe('PUT /api/posts/:postId', () => {
  it('400 invalid content', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ subPage: subPageId });
    expect(res.status).toBe(400);
  });

  it('edits post (200)', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Edited Post',
        content: {
          time: Date.now(),
          blocks: [{ type: 'header', data: { text: 'Edited', level: 2 } }],
          version: '2.28.0',
        },
        subPage: subPageId,
        pinned: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.pinned).toBe(true);
    expect(res.body.data.title).toBe('Edited Post');
  });

  it('404 not found', async () => {
    const res = await request(app)
      .put('/api/posts/68ad7e285d9e6a24a76b249e')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Not Found Title',
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Not Found' } }],
          version: '2.28.0',
        },
        subPage: subPageId,
      });
    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .put('/api/posts/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Bad ID',
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Bad Id' } }],
          version: '2.28.0',
        },
        subPage: subPageId,
      });
    expect(res.status).toBe(500);
  });

  it('edits post with only subPage (200)', async () => {
    const otherPage = await SubPage.create({ name: 'alt-page' });

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Changed SubPage',
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Only subPage' } }],
          version: '2.28.0',
        },
        subPage: otherPage._id.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.data.subPage).toBe(otherPage._id.toString());
  });

  it('edits post with only pinned (200)', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Pinned Toggle',
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Only pinned' } }],
          version: '2.28.0',
        },
        pinned: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.pinned).toBe(false);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws', async () => {
    const spy = jest.spyOn(postDAO, 'editPost').mockRejectedValue(new Error('DB fail'));
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Spy Edit',
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Spy Edit' } }],
          version: '2.28.0',
        },
        subPage: subPageId,
      });
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
