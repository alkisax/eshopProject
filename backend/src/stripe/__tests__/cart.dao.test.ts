import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Commodity from '../models/commodity.models';
import Cart from '../models/cart.models';
import '../models/commodity.models';
import { cartDAO } from '../daos/cart.dao';
import { NotFoundError, ValidationError } from '../types/errors.types';

describe('cartDAO', () => {
  const participantId = new mongoose.Types.ObjectId();
  const commodityId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
      throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    await Cart.deleteMany({});
  });

  afterAll(async () => {
    await Cart.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
    await Commodity.deleteMany({});   // clean

    // Insert a commodity with known ID
    await Commodity.create({
      _id: commodityId,
      name: 'Test Commodity',
      price: 100,
      currency: 'eur',
      stripePriceId: 'price_test_123',
      stock: 10,
      active: true,
    });
  });

  describe('createCart & getCartByParticipant', () => {
    it('should create and fetch a cart for a participant', async () => {
      const created = await cartDAO.createCart(participantId);
      expect(created).toHaveProperty('_id');
      expect(created.items).toHaveLength(0);

      const found = await cartDAO.getCartByParticipant(participantId);
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it('should throw ValidationError if cart already exists', async () => {
      await cartDAO.createCart(participantId);
      await expect(cartDAO.createCart(participantId)).rejects.toThrow(ValidationError);
    });
  });

  describe('addOrRemoveItemToCart', () => {
    it('should add a new item to the cart', async () => {
      await cartDAO.createCart(participantId);
      const updated = await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0].quantity).toBe(2);
    });

    it('should increment quantity if item already exists', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
      const updated = await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 3);

      expect(updated.items[0].quantity).toBe(4);
    });

    it('should remove item if quantity <= 0 after update', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);
      const updated = await cartDAO.addOrRemoveItemToCart(participantId, commodityId, -2);

      expect(updated.items).toHaveLength(0);
    });

    it('should throw NotFoundError if cart does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(cartDAO.addOrRemoveItemToCart(fakeId, commodityId, 1))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update quantity of an existing item', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);

      const updated = await cartDAO.updateItemQuantity(participantId, commodityId, 7);
      expect(updated.items[0].quantity).toBe(7);
    });

    it('should remove item if quantity <= 0', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);

      const updated = await cartDAO.updateItemQuantity(participantId, commodityId, 0);
      expect(updated.items).toHaveLength(0);
    });

    it('should throw NotFoundError if cart not found', async () => {
      const fakeP = new mongoose.Types.ObjectId();
      await expect(cartDAO.updateItemQuantity(fakeP, commodityId, 3))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if item not in cart', async () => {
      await cartDAO.createCart(participantId);
      const fakeCommodity = new mongoose.Types.ObjectId();
      await expect(cartDAO.updateItemQuantity(participantId, fakeCommodity, 5))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from the cart', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 3);

      const cleared = await cartDAO.clearCart(participantId);
      expect(cleared.items).toHaveLength(0);
    });

    it('should throw NotFoundError if cart not found', async () => {
      const fakeP = new mongoose.Types.ObjectId();
      await expect(cartDAO.clearCart(fakeP)).rejects.toThrow(NotFoundError);
    });
  });
  describe('final not happy path', () => {
    it('should auto-create a cart if none exists when calling getCartByParticipant', async () => {
      const participantId = new mongoose.Types.ObjectId();
      const cart = await cartDAO.getCartByParticipant(participantId);
      expect(cart).toHaveProperty('_id');
      expect(cart.participant.toString()).toBe(participantId.toString());
      expect(cart.items).toHaveLength(0);
    });

    it('should throw DatabaseError on unexpected DB error in createCart', async () => {
      const spy = jest.spyOn(Cart.prototype, 'save')
        .mockRejectedValueOnce(new Error('DB error'));

      const participantId = new mongoose.Types.ObjectId();
      await expect(cartDAO.createCart(participantId)).rejects.toThrow('Error creating cart');

      spy.mockRestore();
    });
  });

  describe('cartDAO with stock & price checks', () => {
    let commodityId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      await Cart.deleteMany({});
      await Commodity.deleteMany({});

      // Insert commodity with limited stock
      const commodity = await Commodity.create({
        name: 'Test Commodity',
        price: 50,
        currency: 'eur',
        stripePriceId: 'price_test_123',
        stock: 5,
        active: true,
      });
      commodityId = commodity._id;
    });

    it('should throw ValidationError if adding more than stock', async () => {
      await cartDAO.createCart(participantId);
      await expect(cartDAO.addOrRemoveItemToCart(participantId, commodityId, 10))
        .rejects.toThrow(ValidationError);
    });

    it('should refresh priceAtPurchase when commodity price changes', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);

      // Change commodity price
      await Commodity.findByIdAndUpdate(commodityId, { price: 200 });

      const updated = await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
      expect(updated.items[0].priceAtPurchase).toBe(200);
    });

    it('should refresh priceAtPurchase when updating item quantity', async () => {
      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);

      // Change commodity price
      await Commodity.findByIdAndUpdate(commodityId, { price: 300 });

      const updated = await cartDAO.updateItemQuantity(participantId, commodityId, 2);
      expect(updated.items[0].priceAtPurchase).toBe(300);
    });

    it('should throw NotFoundError if commodity not found in addOrRemoveItemToCart', async () => {
      await cartDAO.createCart(participantId);
      const fakeCommodity = new mongoose.Types.ObjectId();
      await expect(
        cartDAO.addOrRemoveItemToCart(participantId, fakeCommodity, 1)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if adding more items than stock allows', async () => {
      const commodity = await Commodity.create({
        name: 'LowStock',
        price: 20,
        currency: 'eur',
        stripePriceId: 'price_stock',
        stock: 2,
        active: true,
      });

      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 2); // ok
      await expect(
        cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1) // exceed stock
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if commodity deleted before updateItemQuantity', async () => {
      const commodity = await Commodity.create({
        name: 'Temp',
        price: 10,
        currency: 'eur',
        stripePriceId: 'price_temp',
        stock: 5,
        active: true,
      });

      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1);

      // remove commodity from DB
      await Commodity.findByIdAndDelete(commodity._id);

      await expect(
        cartDAO.updateItemQuantity(participantId, commodity._id, 2)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if updating quantity above stock', async () => {
      const commodity = await Commodity.create({
        name: 'StockCheck',
        price: 50,
        currency: 'eur',
        stripePriceId: 'price_check',
        stock: 3,
        active: true,
      });

      await cartDAO.createCart(participantId);
      await cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1);

      await expect(
        cartDAO.updateItemQuantity(participantId, commodity._id, 10)
      ).rejects.toThrow(ValidationError);
    });
  });

});
