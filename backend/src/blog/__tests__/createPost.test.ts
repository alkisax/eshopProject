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

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});

  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-posts-create',
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

  const subPage = await SubPage.create({ name: 'news' });
  subPageId = subPage._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await SubPage.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/posts', () => {
  it('400 invalid content', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ subPage: subPageId });
    expect(res.status).toBe(400);
  });

  it('creates post (201)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        content: { time: Date.now(), blocks: [{ type: 'paragraph', data: { text: 'Created!' } }], version: '2.28.0' },
        subPage: subPageId,
        pinned: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.subPage).toBe(subPageId);
  });
});

describe('DAO errors with spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('500 when DAO throws', async () => {
    const spy = jest.spyOn(postDAO, 'createPost').mockImplementation(() => {
      throw new Error('DB fail');
    });

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        content: {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: 'Spy fail' } }],
          version: '2.28.0'
        },
        subPage: subPageId,
      });

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('DAO catch block wraps Post.create error', async () => {
    const spy = jest.spyOn(Post, 'create').mockRejectedValue(new Error('Mongoose create failed'));

    await expect(
      postDAO.createPost(
        { time: Date.now(), blocks: [{ type: 'paragraph', data: { text: 'fail' } }], version: '2.28.0' },
        subPageId,
        false
      )
    ).rejects.toThrow('Failed to create post: Mongoose create failed');

    spy.mockRestore();
  });
});
