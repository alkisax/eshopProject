"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const cart_models_1 = __importDefault(require("../models/cart.models"));
require("../models/commodity.models");
const cart_dao_1 = require("../daos/cart.dao");
const errors_types_1 = require("../types/errors.types");
describe('cartDAO', () => {
    const participantId = new mongoose_1.default.Types.ObjectId();
    const commodityId = new mongoose_1.default.Types.ObjectId();
    beforeAll(async () => {
        if (!process.env.MONGODB_TEST_URI) {
            throw new Error('MONGODB_TEST_URI environment variable is required');
        }
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI);
        await cart_models_1.default.deleteMany({});
    });
    afterAll(async () => {
        await cart_models_1.default.deleteMany({});
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        await cart_models_1.default.deleteMany({});
        await commodity_models_1.default.deleteMany({}); // clean
        // Insert a commodity with known ID
        await commodity_models_1.default.create({
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
            const created = await cart_dao_1.cartDAO.createCart(participantId);
            expect(created).toHaveProperty('_id');
            expect(created.items).toHaveLength(0);
            const found = await cart_dao_1.cartDAO.getCartByParticipant(participantId);
            expect(found._id.toString()).toBe(created._id.toString());
        });
        it('should throw ValidationError if cart already exists', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await expect(cart_dao_1.cartDAO.createCart(participantId)).rejects.toThrow(errors_types_1.ValidationError);
        });
    });
    describe('addOrRemoveItemToCart', () => {
        it('should add a new item to the cart', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            const updated = await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);
            expect(updated.items).toHaveLength(1);
            expect(updated.items[0].quantity).toBe(2);
        });
        it('should increment quantity if item already exists', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
            const updated = await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 3);
            expect(updated.items[0].quantity).toBe(4);
        });
        it('should remove item if quantity <= 0 after update', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);
            const updated = await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, -2);
            expect(updated.items).toHaveLength(0);
        });
        it('should throw NotFoundError if cart does not exist', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.addOrRemoveItemToCart(fakeId, commodityId, 1))
                .rejects.toThrow(errors_types_1.NotFoundError);
        });
    });
    describe('updateItemQuantity', () => {
        it('should update quantity of an existing item', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);
            const updated = await cart_dao_1.cartDAO.updateItemQuantity(participantId, commodityId, 7);
            expect(updated.items[0].quantity).toBe(7);
        });
        it('should remove item if quantity <= 0', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 2);
            const updated = await cart_dao_1.cartDAO.updateItemQuantity(participantId, commodityId, 0);
            expect(updated.items).toHaveLength(0);
        });
        it('should throw NotFoundError if cart not found', async () => {
            const fakeP = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.updateItemQuantity(fakeP, commodityId, 3))
                .rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should throw NotFoundError if item not in cart', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            const fakeCommodity = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.updateItemQuantity(participantId, fakeCommodity, 5))
                .rejects.toThrow(errors_types_1.NotFoundError);
        });
    });
    describe('clearCart', () => {
        it('should clear all items from the cart', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 3);
            const cleared = await cart_dao_1.cartDAO.clearCart(participantId);
            expect(cleared.items).toHaveLength(0);
        });
        it('should throw NotFoundError if cart not found', async () => {
            const fakeP = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.clearCart(fakeP)).rejects.toThrow(errors_types_1.NotFoundError);
        });
    });
    describe('final not happy path', () => {
        it('should auto-create a cart if none exists when calling getCartByParticipant', async () => {
            const participantId = new mongoose_1.default.Types.ObjectId();
            const cart = await cart_dao_1.cartDAO.getCartByParticipant(participantId);
            expect(cart).toHaveProperty('_id');
            expect(cart.participant.toString()).toBe(participantId.toString());
            expect(cart.items).toHaveLength(0);
        });
        it('should throw DatabaseError on unexpected DB error in createCart', async () => {
            const spy = jest.spyOn(cart_models_1.default.prototype, 'save')
                .mockRejectedValueOnce(new Error('DB error'));
            const participantId = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.createCart(participantId)).rejects.toThrow('Error creating cart');
            spy.mockRestore();
        });
    });
    describe('cartDAO with stock & price checks', () => {
        let commodityId;
        beforeEach(async () => {
            await cart_models_1.default.deleteMany({});
            await commodity_models_1.default.deleteMany({});
            // Insert commodity with limited stock
            const commodity = await commodity_models_1.default.create({
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
            await cart_dao_1.cartDAO.createCart(participantId);
            await expect(cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 10))
                .rejects.toThrow(errors_types_1.ValidationError);
        });
        it('should refresh priceAtPurchase when commodity price changes', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
            // Change commodity price
            await commodity_models_1.default.findByIdAndUpdate(commodityId, { price: 200 });
            const updated = await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
            expect(updated.items[0].priceAtPurchase).toBe(200);
        });
        it('should refresh priceAtPurchase when updating item quantity', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodityId, 1);
            // Change commodity price
            await commodity_models_1.default.findByIdAndUpdate(commodityId, { price: 300 });
            const updated = await cart_dao_1.cartDAO.updateItemQuantity(participantId, commodityId, 2);
            expect(updated.items[0].priceAtPurchase).toBe(300);
        });
        it('should throw NotFoundError if commodity not found in addOrRemoveItemToCart', async () => {
            await cart_dao_1.cartDAO.createCart(participantId);
            const fakeCommodity = new mongoose_1.default.Types.ObjectId();
            await expect(cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, fakeCommodity, 1)).rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should throw ValidationError if adding more items than stock allows', async () => {
            const commodity = await commodity_models_1.default.create({
                name: 'LowStock',
                price: 20,
                currency: 'eur',
                stripePriceId: 'price_stock',
                stock: 2,
                active: true,
            });
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 2); // ok
            await expect(cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1) // exceed stock
            ).rejects.toThrow(errors_types_1.ValidationError);
        });
        it('should throw NotFoundError if commodity deleted before updateItemQuantity', async () => {
            const commodity = await commodity_models_1.default.create({
                name: 'Temp',
                price: 10,
                currency: 'eur',
                stripePriceId: 'price_temp',
                stock: 5,
                active: true,
            });
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1);
            // remove commodity from DB
            await commodity_models_1.default.findByIdAndDelete(commodity._id);
            await expect(cart_dao_1.cartDAO.updateItemQuantity(participantId, commodity._id, 2)).rejects.toThrow(errors_types_1.NotFoundError);
        });
        it('should throw ValidationError if updating quantity above stock', async () => {
            const commodity = await commodity_models_1.default.create({
                name: 'StockCheck',
                price: 50,
                currency: 'eur',
                stripePriceId: 'price_check',
                stock: 3,
                active: true,
            });
            await cart_dao_1.cartDAO.createCart(participantId);
            await cart_dao_1.cartDAO.addOrRemoveItemToCart(participantId, commodity._id, 1);
            await expect(cart_dao_1.cartDAO.updateItemQuantity(participantId, commodity._id, 10)).rejects.toThrow(errors_types_1.ValidationError);
        });
    });
});
//# sourceMappingURL=cart.dao.test.js.map