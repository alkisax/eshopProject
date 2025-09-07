"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const commodity_dao_1 = require("../daos/commodity.dao");
const errors_types_1 = require("../types/errors.types");
describe('commodityDAO', () => {
    beforeAll(async () => {
        if (!process.env.MONGODB_TEST_URI) {
            throw new Error('MONGODB_TEST_URI environment variable is required');
        }
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI);
        await commodity_models_1.default.deleteMany({});
    });
    afterAll(async () => {
        await commodity_models_1.default.deleteMany({});
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        await commodity_models_1.default.deleteMany({});
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
            const commodity = await commodity_dao_1.commodityDAO.createCommodity(data);
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
            await commodity_dao_1.commodityDAO.createCommodity(data);
            await expect(commodity_dao_1.commodityDAO.createCommodity(data)).rejects.toThrow(errors_types_1.ValidationError);
        });
    });
    describe('findAllCommodities', () => {
        it('should return all commodities', async () => {
            await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck A', price: 20, currency: 'eur', stripePriceId: 'price_a', stock: 5, active: true
            });
            await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck B', price: 30, currency: 'eur', stripePriceId: 'price_b', stock: 15, active: true
            });
            const commodities = await commodity_dao_1.commodityDAO.findAllCommodities();
            expect(commodities.length).toBe(2);
            expect(commodities[0]).toHaveProperty('name');
        });
    });
    describe('findCommodityById', () => {
        it('should find a commodity by ID', async () => {
            const data = {
                name: 'Deck C', price: 40, currency: 'eur', stripePriceId: 'price_c', stock: 7, active: true
            };
            const created = await commodity_dao_1.commodityDAO.createCommodity(data);
            const found = await commodity_dao_1.commodityDAO.findCommodityById(created._id);
            expect(found.name).toBe('Deck C');
        });
        it('should throw NotFoundError if not found', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.findCommodityById(fakeId)).rejects.toThrow(errors_types_1.NotFoundError);
        });
    });
    describe('updateCommodityById', () => {
        it('should update a commodity successfully', async () => {
            const data = {
                name: 'Deck D', price: 15, currency: 'eur', stripePriceId: 'price_d', stock: 8, active: true
            };
            const created = await commodity_dao_1.commodityDAO.createCommodity(data);
            const updated = await commodity_dao_1.commodityDAO.updateCommodityById(created._id, { stock: 20 });
            expect(updated.stock).toBe(20);
        });
        it('should throw NotFoundError if commodity not found', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.updateCommodityById(fakeId, { stock: 50 })).rejects.toThrow(errors_types_1.NotFoundError);
        });
    });
    describe('deleteCommodityById', () => {
        it('should delete a commodity successfully', async () => {
            const data = {
                name: 'Deck E', price: 35, currency: 'eur', stripePriceId: 'price_e', stock: 4, active: true
            };
            const created = await commodity_dao_1.commodityDAO.createCommodity(data);
            const deleted = await commodity_dao_1.commodityDAO.deleteCommodityById(created._id);
            expect(deleted._id.toString()).toBe(created._id.toString());
            const all = await commodity_dao_1.commodityDAO.findAllCommodities();
            expect(all.length).toBe(0);
        });
        it('should throw NotFoundError if commodity not found', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.deleteCommodityById(fakeId)).rejects.toThrow(errors_types_1.NotFoundError);
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
            await expect(commodity_dao_1.commodityDAO.createCommodity(badData)).rejects.toThrow(errors_types_1.ValidationError);
        });
        it('should throw DatabaseError on unexpected DB error in update', async () => {
            const spy = jest.spyOn(commodity_models_1.default, 'findByIdAndUpdate')
                .mockRejectedValueOnce(new Error('DB connection lost'));
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.updateCommodityById(fakeId, { stock: 5 })).rejects.toThrow('Unexpected error updating commodity');
            spy.mockRestore();
        });
    });
    describe('comments', () => {
        it('should add a comment to a commodity', async () => {
            const commodity = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck F', price: 45, currency: 'eur', stripePriceId: 'price_f', stock: 12, active: true
            });
            const comment = {
                user: new mongoose_1.default.Types.ObjectId(),
                text: 'Great product!',
                rating: 5,
            };
            const updated = await commodity_dao_1.commodityDAO.addCommentToCommodity(commodity._id, comment);
            expect(updated.comments?.length).toBe(1);
            expect(updated.comments?.[0].text).toBe('Great product!');
        });
        it('should throw NotFoundError when adding a comment to a non-existing commodity', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            const comment = {
                user: new mongoose_1.default.Types.ObjectId(),
                text: 'Invalid',
                rating: 3,
            };
            await expect(commodity_dao_1.commodityDAO.addCommentToCommodity(fakeId, comment)).rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should clear all comments from a commodity', async () => {
            const commodity = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck G', price: 50, currency: 'eur', stripePriceId: 'price_g', stock: 2, active: true
            });
            await commodity_dao_1.commodityDAO.addCommentToCommodity(commodity._id, {
                user: new mongoose_1.default.Types.ObjectId(),
                text: 'First review',
                rating: 4,
            });
            const cleared = await commodity_dao_1.commodityDAO.clearCommentsFromCommodity(commodity._id);
            expect(cleared.comments).toHaveLength(0);
        });
        it('should throw NotFoundError when clearing comments of a non-existing commodity', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.clearCommentsFromCommodity(fakeId)).rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should delete a specific comment by commentId', async () => {
            const commodity = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck O', price: 55, currency: 'eur', stripePriceId: 'price_o', stock: 5, active: true
            });
            const comment1 = { user: new mongoose_1.default.Types.ObjectId(), text: 'First comment', rating: 4 };
            const comment2 = { user: new mongoose_1.default.Types.ObjectId(), text: 'Second comment', rating: 5 };
            // Add two comments
            let updated = await commodity_dao_1.commodityDAO.addCommentToCommodity(commodity._id, comment1);
            updated = await commodity_dao_1.commodityDAO.addCommentToCommodity(commodity._id, comment2);
            expect(updated.comments?.length).toBe(2);
            const commentIdToDelete = updated.comments[0]._id;
            const afterDelete = await commodity_dao_1.commodityDAO.deleteCommentFromCommoditybyCommentId(commodity._id, commentIdToDelete);
            expect(afterDelete.comments?.length).toBe(1);
            expect(afterDelete.comments?.some(c => c._id.toString() === commentIdToDelete.toString())).toBe(false);
        });
        it('should throw NotFoundError when commodity does not exist', async () => {
            const fakeCommodityId = new mongoose_1.default.Types.ObjectId();
            const fakeCommentId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.deleteCommentFromCommoditybyCommentId(fakeCommodityId, fakeCommentId)).rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should not remove any comments if commentId does not exist', async () => {
            const commodity = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck P', price: 65, currency: 'eur', stripePriceId: 'price_p', stock: 6, active: true
            });
            const comment = { user: new mongoose_1.default.Types.ObjectId(), text: 'Persist me', rating: 5 };
            const updated = await commodity_dao_1.commodityDAO.addCommentToCommodity(commodity._id, comment);
            const fakeCommentId = new mongoose_1.default.Types.ObjectId();
            const afterDelete = await commodity_dao_1.commodityDAO.deleteCommentFromCommoditybyCommentId(updated._id, fakeCommentId);
            // commodity is found, but $pull did nothing
            expect(afterDelete.comments?.length).toBe(1);
            expect(afterDelete.comments?.[0].text).toBe('Persist me');
        });
    });
    describe('sellCommodityById', () => {
        it('should decrease stock and increase soldCount', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck H',
                price: 60,
                currency: 'eur',
                stripePriceId: 'price_h',
                stock: 5,
                active: true,
            });
            const updated = await commodity_dao_1.commodityDAO.sellCommodityById(created._id, 2);
            expect(updated.stock).toBe(3);
            expect(updated.soldCount).toBe(2);
        });
        it('should throw ValidationError if quantity <= 0', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck I',
                price: 70,
                currency: 'eur',
                stripePriceId: 'price_i',
                stock: 5,
                active: true,
            });
            await expect(commodity_dao_1.commodityDAO.sellCommodityById(created._id, 0))
                .rejects.toThrow('Quantity must be at least 1');
        });
        it('should throw ValidationError if stock insufficient', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck J',
                price: 80,
                currency: 'eur',
                stripePriceId: 'price_j',
                stock: 1,
                active: true,
            });
            await expect(commodity_dao_1.commodityDAO.sellCommodityById(created._id, 5))
                .rejects.toThrow('Not enough quantity in stock');
        });
    });
    describe('extra error branches', () => {
        it('should throw DatabaseError on unexpected error in createCommodity', async () => {
            const spy = jest
                .spyOn(commodity_models_1.default.prototype, 'save')
                .mockRejectedValueOnce(new Error('boom'));
            const badData = {
                name: 'Deck K',
                price: 90,
                currency: 'eur',
                stripePriceId: 'price_k',
                stock: 3,
                active: true,
            };
            await expect(commodity_dao_1.commodityDAO.createCommodity(badData))
                .rejects.toThrow('Unexpected error creating commodity');
            spy.mockRestore();
        });
        it('should rethrow ValidationError in updateCommodityById if thrown directly', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck L',
                price: 100,
                currency: 'eur',
                stripePriceId: 'price_l',
                stock: 5,
                active: true,
            });
            const spy = jest
                .spyOn(commodity_models_1.default, 'findByIdAndUpdate')
                .mockRejectedValueOnce(Object.assign(new Error('forced'), { name: 'ValidationError' }));
            await expect(commodity_dao_1.commodityDAO.updateCommodityById(created._id, { stock: -10 })).rejects.toThrow(errors_types_1.ValidationError);
            spy.mockRestore();
        });
        it('should throw ValidationError when mongoose throws ValidationError by name in updateCommodityById', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck M',
                price: 110,
                currency: 'eur',
                stripePriceId: 'price_m',
                stock: 5,
                active: true,
            });
            const err = new Error('fake validation');
            err.name = 'ValidationError';
            const spy = jest
                .spyOn(commodity_models_1.default, 'findByIdAndUpdate')
                .mockRejectedValueOnce(err);
            await expect(commodity_dao_1.commodityDAO.updateCommodityById(created._id, { stock: -5 })).rejects.toBeInstanceOf(errors_types_1.ValidationError);
            spy.mockRestore();
        });
        it('should throw NotFoundError when sellCommodityById cannot find commodity', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(commodity_dao_1.commodityDAO.sellCommodityById(fakeId, 1)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
        });
        it('should throw NotFoundError when sellCommodityById update returns null', async () => {
            const created = await commodity_dao_1.commodityDAO.createCommodity({
                name: 'Deck N',
                price: 120,
                currency: 'eur',
                stripePriceId: 'price_n',
                stock: 2,
                active: true,
            });
            const spy = jest
                .spyOn(commodity_models_1.default, 'findByIdAndUpdate')
                .mockResolvedValueOnce(null);
            await expect(commodity_dao_1.commodityDAO.sellCommodityById(created._id, 1)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
            spy.mockRestore();
        });
    });
});
//# sourceMappingURL=commodity.dao.test.js.map