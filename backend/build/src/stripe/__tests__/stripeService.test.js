"use strict";
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const globals_1 = require("@jest/globals");
const mongoose_1 = require("mongoose");
const mockCart = {
    _id: new mongoose_1.Types.ObjectId(),
    participant: new mongoose_1.Types.ObjectId(),
    items: [
        {
            commodity: {
                _id: new mongoose_1.Types.ObjectId(),
                name: 'Test Item',
                price: 1000,
                currency: 'eur',
                stripePriceId: 'price_123',
                soldCount: 0,
                stock: 10,
                active: true,
            },
            quantity: 2,
            priceAtPurchase: 1000,
        },
    ],
};
// Reset modules before each test so we can safely re-mock Stripe
beforeEach(() => {
    globals_1.jest.resetModules(); // clear module cache
    process.env.STRIPE_SECRET_KEY = 'test_secret'; // always set a default
});
describe('stripeService (unit)', () => {
    it('calls Stripe.sessions.create with correct args', async () => {
        globals_1.jest.doMock('stripe', () => globals_1.jest.fn().mockImplementation(() => ({
            checkout: {
                sessions: {
                    create: globals_1.jest
                        .fn()
                        .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
                    retrieve: globals_1.jest.fn(),
                },
            },
        })));
        // Import AFTER mocking Stripe
        const { stripeService } = await Promise.resolve().then(() => __importStar(require('../services/stripe.service')));
        process.env.FRONTEND_URL = 'http://test.local';
        const result = await stripeService.createCheckoutSession(mockCart, {
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
        });
        expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
    });
    it('calls Stripe.sessions.retrieve with given sessionId', async () => {
        globals_1.jest.doMock('stripe', () => globals_1.jest.fn().mockImplementation(() => ({
            checkout: {
                sessions: {
                    create: globals_1.jest.fn(),
                    retrieve: globals_1.jest
                        .fn()
                        .mockResolvedValue({
                        id: 'mock_sess',
                        metadata: { email: 'a@b.c' },
                    }),
                },
            },
        })));
        const { stripeService } = await Promise.resolve().then(() => __importStar(require('../services/stripe.service')));
        const result = await stripeService.retrieveSession('sess_123');
        expect(result).toEqual({
            id: 'mock_sess',
            metadata: { email: 'a@b.c' },
        });
    });
    it('throws if STRIPE_SECRET_KEY is missing', async () => {
        delete process.env.STRIPE_SECRET_KEY;
        await expect(async () => {
            await Promise.resolve().then(() => __importStar(require('../services/stripe.service')));
        }).rejects.toThrow('missing env variables');
    });
    it('falls back to default FRONTEND_URL if env not set', async () => {
        globals_1.jest.doMock('stripe', () => globals_1.jest.fn().mockImplementation(() => ({
            checkout: {
                sessions: {
                    create: globals_1.jest
                        .fn()
                        .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
                    retrieve: globals_1.jest.fn(),
                },
            },
        })));
        delete process.env.FRONTEND_URL; // force default branch
        const { stripeService } = await Promise.resolve().then(() => __importStar(require('../services/stripe.service')));
        const result = await stripeService.createCheckoutSession(mockCart);
        expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
    });
    it('uses empty string when participantInfo fields are missing', async () => {
        globals_1.jest.doMock('stripe', () => globals_1.jest.fn().mockImplementation(() => ({
            checkout: {
                sessions: {
                    create: globals_1.jest
                        .fn()
                        .mockResolvedValue({ id: 'mock_sess', url: 'mock_url' }),
                    retrieve: globals_1.jest.fn(),
                },
            },
        })));
        process.env.FRONTEND_URL = 'http://test.local';
        const { stripeService } = await Promise.resolve().then(() => __importStar(require('../services/stripe.service')));
        const result = await stripeService.createCheckoutSession(mockCart, {});
        expect(result).toEqual({ id: 'mock_sess', url: 'mock_url' });
    });
});
//# sourceMappingURL=stripeService.test.js.map