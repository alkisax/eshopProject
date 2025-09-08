"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const cart_models_1 = __importDefault(require("../models/cart.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const cart_dao_1 = require("../daos/cart.dao");
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
beforeAll(async () => {
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await cart_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
});
afterAll(async () => {
    await cart_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('GET /api/cart', () => {
    it('should return empty array if no carts exist', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/cart');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
    });
    it('should return carts with items populated', async () => {
        const participant = await participant_models_1.default.create({
            email: 'test@example.com',
            name: 'Test',
            surname: 'User',
        });
        const commodity = await commodity_models_1.default.create({
            name: 'Test Product',
            price: 10,
            stripePriceId: 'price_123',
            stock: 5,
        });
        await cart_models_1.default.create({
            participant: participant._id,
            items: [
                {
                    commodity: commodity._id,
                    quantity: 2,
                    priceAtPurchase: 10,
                },
            ],
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/cart');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].items[0].commodity.name).toBe('Test Product');
    });
    it('should return 500 if DAO throws error', async () => {
        const spy = jest
            .spyOn(cart_dao_1.cartDAO, 'getAllCarts')
            .mockRejectedValueOnce(new Error('DB fail'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/cart');
        expect(res.status).toBe(500);
        spy.mockRestore();
    });
});
//# sourceMappingURL=cart.getAllCarts.test.js.map