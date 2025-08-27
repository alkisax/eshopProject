import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';

import User from '../../login/models/users.models';
import Cart from '../models/cart.models';
import Commodity from '../models/commodity.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI environment variable is required');
}

const TEST_USER = {
  username: 'cartuser',
  name: 'Cart User',
  email: 'cartuser@example.com',
  password: 'securepassword',
  roles: ['USER'],
};

let userToken: string;
let userId: string;
let commodityId: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Commodity.deleteMany({});

  // Create user
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

  // Create one commodity to use in cart tests
  const commodityRes = await Commodity.create({
    name: 'Cart Test Product',
    price: 30,
    currency: 'eur',
    stripePriceId: 'price_cart_1',
    stock: 20,
    active: true,
  });
  commodityId = commodityRes._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Commodity.deleteMany({});
  await disconnect();
});

describe('Cart Controller', () => {
  it('should create a cart for the participant', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ participantId: userId });

    expect(res.status).toBe(201);
    expect(res.body.data.participant).toBe(userId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('should fetch cart for participant', async () => {
    const res = await request(app)
      .get(`/api/cart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.participant).toBe(userId);
  });

  it('should add an item to the cart', async () => {
    const res = await request(app)
      .patch(`/api/cart/${userId}/items`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].commodity).toBe(commodityId);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('should increment quantity when adding same item again', async () => {
    const res = await request(app)
      .patch(`/api/cart/${userId}/items`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(3); // 2 + 1
  });

  it('should update quantity directly', async () => {
    const res = await request(app)
      .patch(`/api/cart/${userId}/items/update`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(5);
  });

  it('should remove item if quantity set to 0', async () => {
    const res = await request(app)
      .patch(`/api/cart/${userId}/items/update`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId, quantity: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });

  it('should clear cart completely', async () => {
    // Add one item first
    await request(app)
      .patch(`/api/cart/${userId}/items`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId, quantity: 2 });

    const res = await request(app)
      .delete(`/api/cart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
  });

  describe('Negative cases', () => {
    it('should return 404 if cart not found on update', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .patch(`/api/cart/${fakeId}/items/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ commodityId, quantity: 2 });

      expect(res.status).toBe(404);
    });

    it('should return 404 if cart not found on clear', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .delete(`/api/cart/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
