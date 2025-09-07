"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const mongoose_1 = require("mongoose");
// Mock appwrite (to avoid env crashes)
jest.mock('../../utils/appwrite.ts', () => ({
    account: {},
    OAuthProvider: { Google: 'google' },
}));
// Mock services + DAOs (except cartDAO, which we spy on)
const mockCreateCheckoutSession = jest.fn();
const mockRetrieveSession = jest.fn();
jest.mock('../services/stripe.service', () => ({
    stripeService: {
        createCheckoutSession: (...args) => mockCreateCheckoutSession(...args),
        retrieveSession: (...args) => mockRetrieveSession(...args),
    },
}));
const mockFindBySessionId = jest.fn();
const mockCreateTransaction = jest.fn();
jest.mock('../daos/transaction.dao', () => ({
    transactionDAO: {
        findBySessionId: (...args) => mockFindBySessionId(...args),
        createTransaction: (...args) => mockCreateTransaction(...args),
    },
}));
const mockFindParticipantByEmail = jest.fn();
const mockCreateParticipant = jest.fn();
jest.mock('../daos/participant.dao', () => ({
    participantDao: {
        findParticipantByEmail: (...args) => mockFindParticipantByEmail(...args),
        createParticipant: (...args) => mockCreateParticipant(...args),
    },
}));
// Mock fetchCart (still full mock)
const mockFetchCart = jest.fn();
jest.mock('../daos/stripe.dao', () => ({
    fetchCart: (...args) => mockFetchCart(...args),
}));
// Import cartDAO normally so we can spy on it
const cart_dao_1 = require("../daos/cart.dao");
afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});
// Minimal mock cart
const mockCart = {
    _id: new mongoose_1.Types.ObjectId(),
    participant: new mongoose_1.Types.ObjectId(),
    items: [],
};
describe('Stripe Controller', () => {
    describe('POST /api/stripe/checkout/cart', () => {
        it('returns 200 with checkout session', async () => {
            mockFetchCart.mockResolvedValue(mockCart);
            mockCreateCheckoutSession.mockResolvedValue({ id: 'mock_id', url: 'mock_url' });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/stripe/checkout/cart')
                .send({
                participantId: mockCart.participant.toString(),
                participantInfo: { email: 'john@example.com' },
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toEqual({ id: 'mock_id', url: 'mock_url' });
        });
        it('returns 500 if service throws', async () => {
            mockFetchCart.mockResolvedValue(mockCart);
            mockCreateCheckoutSession.mockRejectedValue(new Error('fail'));
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/stripe/checkout/cart')
                .send({ participantId: mockCart.participant.toString() });
            expect(res.status).toBe(500);
        });
    });
    describe('GET /api/stripe/success', () => {
        beforeEach(() => {
            // Spy on clearCart to avoid hitting real DB
            jest.spyOn(cart_dao_1.cartDAO, 'clearCart').mockResolvedValue(null);
        });
        it('redirects if no session_id', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success');
            expect(res.status).toBe(302);
            expect(res.headers.location).toMatch(/\/cancel\?error=missingSessionId/);
        });
        it('returns 409 if transaction already exists', async () => {
            mockFindBySessionId.mockResolvedValue({ _id: 't1' });
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(409);
        });
        it('redirects if no email in session', async () => {
            mockFindBySessionId.mockResolvedValue(null);
            mockRetrieveSession.mockResolvedValue({ metadata: {}, amount_total: 100, payment_status: 'paid' });
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(302);
            expect(res.headers.location).toMatch(/\/cancel\?error=noEmailMetadata/);
        });
        it('returns 400 if amount is 0', async () => {
            mockFindBySessionId.mockResolvedValue(null);
            mockRetrieveSession.mockResolvedValue({
                metadata: { email: 'a@b.c' },
                amount_total: 0,
                payment_status: 'paid',
            });
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(400);
        });
        it('creates new participant if not found', async () => {
            mockFindBySessionId.mockResolvedValue(null);
            mockRetrieveSession.mockResolvedValue({
                metadata: { email: 'a@b.c' },
                amount_total: 200,
                payment_status: 'paid',
            });
            mockFindParticipantByEmail.mockResolvedValue(null);
            mockCreateParticipant.mockResolvedValue({ _id: new mongoose_1.Types.ObjectId(), email: 'a@b.c' });
            mockCreateTransaction.mockResolvedValue({ _id: 't1' });
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(302);
            expect(res.headers.location).toMatch(/\/checkout-success\?session_id=abc/);
            expect(mockCreateParticipant).toHaveBeenCalled();
            expect(mockCreateTransaction).toHaveBeenCalled();
            expect(cart_dao_1.cartDAO.clearCart).toHaveBeenCalled();
        });
        it('uses existing participant if found', async () => {
            mockFindBySessionId.mockResolvedValue(null);
            mockRetrieveSession.mockResolvedValue({
                metadata: { email: 'a@b.c' },
                amount_total: 200,
                payment_status: 'paid',
            });
            mockFindParticipantByEmail.mockResolvedValue({ _id: new mongoose_1.Types.ObjectId(), email: 'a@b.c' });
            mockCreateTransaction.mockResolvedValue({ _id: 't1' });
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(302);
            expect(res.headers.location).toMatch(/\/checkout-success\?session_id=abc/);
            expect(mockFindParticipantByEmail).toHaveBeenCalledWith('a@b.c');
            expect(mockCreateTransaction).toHaveBeenCalled();
            expect(cart_dao_1.cartDAO.clearCart).toHaveBeenCalled();
        });
        it('redirects if stripeService.retrieveSession throws', async () => {
            mockFindBySessionId.mockResolvedValue(null);
            mockRetrieveSession.mockRejectedValue(new Error('unexpected fail'));
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/success?session_id=abc');
            expect(res.status).toBe(302);
            expect(res.headers.location).toMatch(/\/cancel\?error=server/);
        });
    });
    describe('GET /api/stripe/cancel', () => {
        it('returns cancel message', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/stripe/cancel');
            expect(res.status).toBe(200);
            expect(res.text).toContain('Payment canceled');
        });
    });
});
//# sourceMappingURL=stripe.test.js.map