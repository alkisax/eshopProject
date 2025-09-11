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

if (!process.env.MONGODB_TEST_URI) {throw new Error('MONGODB_TEST_URI is required');}
if (!process.env.JWT_SECRET) {throw new Error('JWT_SECRET is required');}

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
    username: 'admin-posts-del',
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

  const subPage = await SubPage.create({ name: 'general' });
  subPageId = subPage._id.toString();

  const post = await Post.create({
    content: { time: Date.now(), blocks: [{ type: 'paragraph', data: { text: 'Delete Me' } }], version: '2.28.0' },
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

describe('DELETE /api/posts/:postId', () => {
  it('deletes post (200)', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  it('404 when already deleted', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('500 invalid id format', async () => {
    const res = await request(app)
      .delete('/api/posts/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
  });
});

describe('DAO errors with spyOn', () => {
  it('500 when DAO throws', async () => {
    const subPage = await SubPage.create({ name: 'spyDel' });
    const tempPost = await Post.create({
      content: { time: Date.now(), blocks: [{ type: 'paragraph', data: { text: 'Spy Delete' } }], version: '2.28.0' },
      subPage: subPage._id.toString(),
      pinned: false,
    });

    const spy = jest.spyOn(postDAO, 'deletePost').mockRejectedValue(new Error('DB fail'));
    const res = await request(app)
      .delete(`/api/posts/${tempPost._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
