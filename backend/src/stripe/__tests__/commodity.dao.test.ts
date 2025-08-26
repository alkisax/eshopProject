import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Commodity from '../models/commodity.models';
import { commodityDAO } from '../daos/commodity.dao';
import { ValidationError, NotFoundError } from '../types/errors.types';

describe('commodityDAO', () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
      throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    await Commodity.deleteMany({});
  });

  afterAll(async () => {
    await Commodity.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Commodity.deleteMany({});
  });

  describe('createCommodity', () => {
    it('should create a new commodity successfully', async () => {
      const data = {
        name: 'Tarot Deck',
        price: 25,
        currency: 'eur',
        stripePriceId: 'price_123',
        stock: 10,
        active: true
      };
      const commodity = await commodityDAO.createCommodity(data);
      expect(commodity).toHaveProperty('_id');
      expect(commodity.name).toBe('Tarot Deck');
      expect(commodity.price).toBe(25);
    });

    it('should throw ValidationError if stripePriceId already exists', async () => {
      const data = {
        name: 'Tarot Deck',
        price: 25,
        currency: 'eur',
        stripePriceId: 'price_123',
        stock: 10,
        active: true
      };
      await commodityDAO.createCommodity(data);

      await expect(commodityDAO.createCommodity(data)).rejects.toThrow(ValidationError);
    });
  });

  describe('findAllCommodities', () => {
    it('should return all commodities', async () => {
      await commodityDAO.createCommodity({
        name: 'Deck A', price: 20, currency: 'eur', stripePriceId: 'price_a', stock: 5, active: true
      });
      await commodityDAO.createCommodity({
        name: 'Deck B', price: 30, currency: 'eur', stripePriceId: 'price_b', stock: 15, active: true
      });

      const commodities = await commodityDAO.findAllCommodities();
      expect(commodities.length).toBe(2);
      expect(commodities[0]).toHaveProperty('name');
    });
  });

  describe('findCommodityById', () => {
    it('should find a commodity by ID', async () => {
      const data = {
        name: 'Deck C', price: 40, currency: 'eur', stripePriceId: 'price_c', stock: 7, active: true
      };
      const created = await commodityDAO.createCommodity(data);

      const found = await commodityDAO.findCommodityById(created._id);
      expect(found.name).toBe('Deck C');
    });

    it('should throw NotFoundError if not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(commodityDAO.findCommodityById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateCommodityById', () => {
    it('should update a commodity successfully', async () => {
      const data = {
        name: 'Deck D', price: 15, currency: 'eur', stripePriceId: 'price_d', stock: 8, active: true
      };
      const created = await commodityDAO.createCommodity(data);

      const updated = await commodityDAO.updateCommodityById(created._id, { stock: 20 });
      expect(updated.stock).toBe(20);
    });

    it('should throw NotFoundError if commodity not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(commodityDAO.updateCommodityById(fakeId, { stock: 50 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCommodityById', () => {
    it('should delete a commodity successfully', async () => {
      const data = {
        name: 'Deck E', price: 35, currency: 'eur', stripePriceId: 'price_e', stock: 4, active: true
      };
      const created = await commodityDAO.createCommodity(data);

      const deleted = await commodityDAO.deleteCommodityById(created._id);
      expect(deleted._id.toString()).toBe(created._id.toString());

      const all = await commodityDAO.findAllCommodities();
      expect(all.length).toBe(0);
    });

    it('should throw NotFoundError if commodity not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(commodityDAO.deleteCommodityById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('error branches', () => {
    it('should throw ValidationError when missing required fields', async () => {
      const badData = {
        // missing name and price
        stripePriceId: 'price_invalid',
        currency: 'eur',
        stock: 5,
        active: true
      };
      await expect(commodityDAO.createCommodity(badData)).rejects.toThrow(ValidationError);
    });

    it('should throw DatabaseError on unexpected DB error in update', async () => {
      const spy = jest.spyOn(Commodity, 'findByIdAndUpdate')
        .mockRejectedValueOnce(new Error('DB connection lost'));

      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        commodityDAO.updateCommodityById(fakeId, { stock: 5 })
      ).rejects.toThrow('Unexpected error updating commodity');

      spy.mockRestore();
    });
  });

  describe('comments', () => {
    it('should add a comment to a commodity', async () => {
      const commodity = await commodityDAO.createCommodity({
        name: 'Deck F', price: 45, currency: 'eur', stripePriceId: 'price_f', stock: 12, active: true
      });

      const comment = {
        user: new mongoose.Types.ObjectId(),
        text: 'Great product!',
        rating: 5 as const,
      };

      const updated = await commodityDAO.addCommentToCommodity(commodity._id, comment);
      expect(updated.comments?.length).toBe(1);
      expect(updated.comments?.[0].text).toBe('Great product!');
    });

    it('should throw NotFoundError when adding a comment to a non-existing commodity', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const comment = {
        user: new mongoose.Types.ObjectId(),
        text: 'Invalid',
        rating: 3 as const,
      };
      await expect(
        commodityDAO.addCommentToCommodity(fakeId, comment)
      ).rejects.toThrow(NotFoundError);
    });

    it('should clear all comments from a commodity', async () => {
      const commodity = await commodityDAO.createCommodity({
        name: 'Deck G', price: 50, currency: 'eur', stripePriceId: 'price_g', stock: 2, active: true
      });

      await commodityDAO.addCommentToCommodity(commodity._id, {
        user: new mongoose.Types.ObjectId(),
        text: 'First review',
        rating: 4,
      });

      const cleared = await commodityDAO.clearCommentsFromCommodity(commodity._id);
      expect(cleared.comments).toHaveLength(0);
    });

    it('should throw NotFoundError when clearing comments of a non-existing commodity', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        commodityDAO.clearCommentsFromCommodity(fakeId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
