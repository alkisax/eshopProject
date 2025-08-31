// src/stripe/__tests__/stripe.dao.test.ts
import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Cart from '../models/cart.models';
import Participant from '../models/participant.models';
import Commodity from '../models/commodity.models';

import { fetchCart } from '../daos/stripe.dao';
import { ValidationError } from '../types/errors.types';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await connect(process.env.MONGODB_TEST_URI);
  await Cart.deleteMany({});
  await Participant.deleteMany({});
  await Commodity.deleteMany({});
});

afterAll(async () => {
  await Cart.deleteMany({});
  await Participant.deleteMany({});
  await Commodity.deleteMany({});
  await disconnect();
});

describe('stripe.dao - fetchCart', () => {
  let participantId: string;
  let commodityId: string;

  beforeEach(async () => {
    await Cart.deleteMany({});
    await Participant.deleteMany({});
    await Commodity.deleteMany({});

    const participant = await Participant.create({
      name: 'CartUser',
      surname: 'Test',
      email: `cartuser_${Date.now()}@example.com`,
      transactions: []
    });
    participantId = participant._id.toString();

    const commodity = await Commodity.create({
      name: 'Test Product',
      price: 100,
      currency: 'eur',
      stripePriceId: `price_${Date.now()}`,
      stock: 10,
      soldCount: 0,
      active: true
    });
    commodityId = commodity._id.toString();

    await Cart.create({
      participant: participantId,
      items: [
        { commodity: commodityId, quantity: 2, priceAtPurchase: 100 }
      ]
    });
  });

  it('should fetch a populated cart successfully', async () => {
    const cart = await fetchCart(participantId);

    expect(cart.participant.toString()).toBe(participantId);
    expect(cart.items.length).toBe(1);

    const commodity = cart.items[0].commodity;
    if (typeof commodity === 'object' && 'name' in commodity) {
      expect(commodity.name).toBe('Test Product');
    } else {
      throw new Error('Commodity was not populated');
    }
  });

  it('should throw ValidationError if cart does not exist', async () => {
    await Cart.deleteMany({});
    await expect(fetchCart(participantId)).rejects.toBeInstanceOf(ValidationError);
  });

  it('should throw ValidationError if cart exists but is empty', async () => {
    await Cart.deleteMany({});
    await Cart.create({ participant: participantId, items: [] });
    await expect(fetchCart(participantId)).rejects.toBeInstanceOf(ValidationError);
  });
});
