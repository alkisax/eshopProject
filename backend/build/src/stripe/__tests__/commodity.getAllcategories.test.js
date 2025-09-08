"use strict";
// backend/src/commodity/__tests__/commodity.categories.test.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ✅ Prevent real Stripe calls
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        charges: { create: jest.fn().mockResolvedValue({ success: true }) }
    }));
});
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importStar(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
}
describe('Commodity Controller - getAllCategories', () => {
    beforeAll(async () => {
        await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    });
    afterAll(async () => {
        await commodity_models_1.default.deleteMany({});
        await (0, mongoose_1.disconnect)();
    });
    beforeEach(async () => {
        await commodity_models_1.default.deleteMany({});
    });
    it('should return all unique categories from commodities', async () => {
        await commodity_models_1.default.create({
            name: 'Phone',
            description: 'Smartphone',
            category: ['Electronics'],
            price: 500,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}a`,
            stock: 10
        });
        await commodity_models_1.default.create({
            name: 'Book',
            description: 'Fiction',
            category: ['Books'],
            price: 20,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}b`,
            stock: 50
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toEqual(expect.arrayContaining(['Electronics', 'Books']));
    });
    it('should return an empty array if no commodities exist', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toEqual([]);
    });
    it('should not return duplicate categories', async () => {
        await commodity_models_1.default.create({
            name: 'Phone',
            description: 'Smartphone',
            category: ['Electronics'],
            price: 500,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}c`,
            stock: 10
        });
        await commodity_models_1.default.create({
            name: 'Laptop',
            description: 'Gaming',
            category: ['Electronics'], // duplicate category
            price: 1200,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}d`,
            stock: 5
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toEqual(['Electronics']); // only one unique
    });
});
describe('more test with mock unhappy path', () => {
    beforeAll(async () => {
        // ensure DB is connected for this block
        if (mongoose_1.default.connection.readyState === 0) {
            await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
        }
    });
    beforeEach(async () => {
        await commodity_models_1.default.deleteMany({});
    });
    afterAll(async () => {
        await commodity_models_1.default.deleteMany({});
        await (0, mongoose_1.disconnect)();
    });
    it('should ignore empty string categories', async () => {
        await commodity_models_1.default.create({
            name: 'Broken Commodity',
            description: 'Has empty category',
            category: [''],
            price: 1,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}e`,
            stock: 1,
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toEqual([]);
    });
    it('should flatten multiple categories per commodity', async () => {
        await commodity_models_1.default.create({
            name: 'Combo Item',
            description: 'Belongs to 2 categories',
            category: ['Books', 'Toys'],
            price: 10,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}f`,
            stock: 3,
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toEqual(expect.arrayContaining(['Books', 'Toys']));
    });
    it('should return categories sorted alphabetically', async () => {
        await commodity_models_1.default.create({
            name: 'Item1',
            description: 'Category C',
            category: ['Zebra'],
            price: 1,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}g`,
            stock: 1,
        });
        await commodity_models_1.default.create({
            name: 'Item2',
            description: 'Category A',
            category: ['Apple'],
            price: 1,
            currency: 'eur',
            stripePriceId: `price_${Date.now()}h`,
            stock: 1,
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/commodity/categories');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toEqual(['Apple', 'Zebra']);
    });
});
//# sourceMappingURL=commodity.getAllcategories.test.js.map