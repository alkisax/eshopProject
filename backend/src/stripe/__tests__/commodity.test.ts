import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';

import User from '../../login/models/users.models';
import Commodity from '../models/commodity.models';

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI environment variable is required');
}

const TEST_ADMIN = {
  username: 'adminuser',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'securepassword',
  roles: ['ADMIN'],
};

const TEST_USER = {
  username: 'normaluser',
  name: 'Normal User',
  email: 'user@example.com',
  password: 'securepassword',
  roles: ['USER'],
};

let adminToken: string;
let userToken: string;
let commodityId: string;

let userId: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // Create admin user
  const hashedPasswordAdmin = await hash(TEST_ADMIN.password, 10);
  await User.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword: hashedPasswordAdmin,
    roles: TEST_ADMIN.roles,
  });

  const adminRes = await request(app)
    .post('/api/auth')
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  adminToken = adminRes.body.data.token;

  // Create normal user
  const hashedPasswordUser = await hash(TEST_USER.password, 10);
  const user = await User.create({
    username: TEST_USER.username,
    name: TEST_USER.name,
    email: TEST_USER.email,
    hashedPassword: hashedPasswordUser,
    roles: TEST_USER.roles,
  });
  userId = user._id.toString();

  const userRes = await request(app)
    .post('/api/auth')
    .send({ username: TEST_USER.username, password: TEST_USER.password });

  userToken = userRes.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Commodity.deleteMany({});
  await disconnect();
});

describe('Commodity Controller', () => {
  it('should create a new commodity (admin only)', async () => {
    const res = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Commodity',
        description: 'A test commodity',
        price: 20,
        currency: 'eur',
        stripePriceId: 'price_123',
        stock: 10,
        active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Commodity');
    commodityId = res.body.data._id;
  });

  it('should fail to create commodity without admin token', async () => {
    const res = await request(app)
      .post('/api/commodity')
      .send({
        name: 'No Auth Commodity',
        price: 15,
        stripePriceId: 'price_noauth',
      });

    expect(res.status).toBe(401);
  });

  it('should fetch all commodities', async () => {
    const res = await request(app).get('/api/commodity');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch a commodity by ID', async () => {
    const res = await request(app).get(`/api/commodity/${commodityId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(commodityId);
  });

  it('should update a commodity (admin only)', async () => {
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.stock).toBe(50);
  });

  it('should allow user to add a comment', async () => {
    const res = await request(app)
      .post(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ user: userId, text: 'Great product!', rating: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(1);
    expect(res.body.data.comments[0].text).toBe('Great product!');
  });

  it('should allow admin to clear comments', async () => {
    const res = await request(app)
      .delete(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(0);
  });

  it('should delete a commodity (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/commodity/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });

  describe('Negative cases', () => {
    it('should return 400 if creating comment without user/text', async () => {
      const res = await request(app)
        .post(`/api/commodity/${commodityId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 3 }); // missing user + text

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Comment requires user and text/);
    });

    it('should return 404 when fetching a non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app).get(`/api/commodity/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when updating non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .patch(`/api/commodity/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 77 });

      expect(res.status).toBe(404);
    });

    it('should return 404 when deleting non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .delete(`/api/commodity/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401/403 when non-admin tries to create commodity', async () => {
      const res = await request(app)
        .post('/api/commodity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Commodity',
          price: 10,
          stripePriceId: 'price_unauth',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('should return 401/403 when non-admin tries to delete commodity', async () => {
      const res = await request(app)
        .delete(`/api/commodity/${commodityId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should return 400 when updating commodity without ID param', async () => {
      const res = await request(app)
        .patch('/api/commodity/') // missing id
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 99 });

      expect([400, 404]).toContain(res.status);
    });

    it('should return 400 when deleting commodity without ID param', async () => {
      const res = await request(app)
        .delete('/api/commodity/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(res.status);
    });

    it('should return 400 when clearing comments without ID param', async () => {
      const res = await request(app)
        .delete('/api/commodity//comments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(res.status);
    });
  });
});
