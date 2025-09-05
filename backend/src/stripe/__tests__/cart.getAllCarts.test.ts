import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Cart from '../models/cart.models';
import Commodity from '../models/commodity.models';
import Participant from '../models/participant.models';
import { cartDAO } from '../daos/cart.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Cart.deleteMany({});
  await Commodity.deleteMany({});
  await Participant.deleteMany({});
});

afterAll(async () => {
  await Cart.deleteMany({});
  await Commodity.deleteMany({});
  await Participant.deleteMany({});
  await disconnect();
});

describe('GET /api/cart', () => {
  it('should return empty array if no carts exist', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('should return carts with items populated', async () => {
    const participant = await Participant.create({
      email: 'test@example.com',
      name: 'Test',
      surname: 'User',
    });

    const commodity = await Commodity.create({
      name: 'Test Product',
      price: 10,
      stripePriceId: 'price_123',
      stock: 5,
    });

    await Cart.create({
      participant: participant._id,
      items: [
        {
          commodity: commodity._id,
          quantity: 2,
          priceAtPurchase: 10,
        },
      ],
    });

    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].items[0].commodity.name).toBe('Test Product');
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest
      .spyOn(cartDAO, 'getAllCarts')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});
