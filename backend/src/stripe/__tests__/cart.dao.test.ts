import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
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

});
