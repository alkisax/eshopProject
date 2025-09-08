"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/stripe/__tests__/stripe.dao.test.ts
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cart_models_1 = __importDefault(require("../models/cart.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const stripe_dao_1 = require("../daos/stripe.dao");
const errors_types_1 = require("../types/errors.types");
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await cart_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
});
afterAll(async () => {
    await cart_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('stripe.dao - fetchCart', () => {
    let participantId;
    let commodityId;
    beforeEach(async () => {
        await cart_models_1.default.deleteMany({});
        await participant_models_1.default.deleteMany({});
        await commodity_models_1.default.deleteMany({});
        const participant = await participant_models_1.default.create({
            name: 'CartUser',
            surname: 'Test',
            email: `cartuser_${Date.now()}@example.com`,
            transactions: []
        });
        participantId = participant._id.toString();
        const commodity = await commodity_models_1.default.create({
            name: 'Test Product',
            price: 100,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}`,
            stock: 10,
            soldCount: 0,
            active: true
        });
        commodityId = commodity._id.toString();
        await cart_models_1.default.create({
            participant: participantId,
            items: [
                { commodity: commodityId, quantity: 2, priceAtPurchase: 100 }
            ]
        });
    });
    it('should fetch a populated cart successfully', async () => {
        const cart = await (0, stripe_dao_1.fetchCart)(participantId);
        expect(cart.participant.toString()).toBe(participantId);
        expect(cart.items.length).toBe(1);
        const commodity = cart.items[0].commodity;
        if (typeof commodity === 'object' && 'name' in commodity) {
            expect(commodity.name).toBe('Test Product');
        }
        else {
            throw new Error('Commodity was not populated');
        }
    });
    it('should throw ValidationError if cart does not exist', async () => {
        await cart_models_1.default.deleteMany({});
        await expect((0, stripe_dao_1.fetchCart)(participantId)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should throw ValidationError if cart exists but is empty', async () => {
        await cart_models_1.default.deleteMany({});
        await cart_models_1.default.create({ participant: participantId, items: [] });
        await expect((0, stripe_dao_1.fetchCart)(participantId)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
});
//# sourceMappingURL=stripe.dao.test.js.map