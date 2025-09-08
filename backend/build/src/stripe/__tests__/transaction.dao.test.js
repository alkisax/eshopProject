"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_2 = __importDefault(require("mongoose"));
const transaction_models_1 = __importDefault(require("../models/transaction.models"));
const participant_models_1 = __importDefault(require("../models/participant.models"));
const commodity_models_1 = __importDefault(require("../models/commodity.models"));
const cart_models_1 = __importDefault(require("../models/cart.models"));
const transaction_dao_1 = require("../daos/transaction.dao");
const errors_types_1 = require("../types/errors.types");
// import { DatabaseError } from '../types/errors.types';
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
});
afterAll(async () => {
    await transaction_models_1.default.deleteMany({});
    await participant_models_1.default.deleteMany({});
    await commodity_models_1.default.deleteMany({});
    await cart_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('transactionDAO', () => {
    let participantId;
    let commodityId;
    beforeEach(async () => {
        await transaction_models_1.default.deleteMany({});
        await participant_models_1.default.deleteMany({});
        await commodity_models_1.default.deleteMany({});
        await cart_models_1.default.deleteMany({});
        // Create participant
        const participant = await participant_models_1.default.create({
            name: 'TxUser',
            surname: 'Test',
            email: `txuser_${Date.now()}@example.com`,
            transactions: []
        });
        participantId = participant._id.toString();
        // Create commodity
        const commodity = await commodity_models_1.default.create({
            name: 'Test Product',
            description: 'Test description',
            category: ['test'],
            price: 50,
            currency: 'eur',
            stripePriceId: `stripe_${Date.now()}`,
            stock: 10,
            soldCount: 0,
            active: true,
        });
        commodityId = commodity._id.toString();
        // Create cart with one item
        await cart_models_1.default.create({
            participant: participantId,
            items: [
                {
                    commodity: commodityId,
                    quantity: 2,
                    priceAtPurchase: commodity.price,
                },
            ],
        });
    });
    it('should create a transaction successfully from cart', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        expect(tx.participant.toString()).toBe(participantId);
        expect(tx.items.length).toBe(1);
        expect(tx.amount).toBe(100); // 2 * 50
    });
    it('should throw ValidationError if cart is empty', async () => {
        await cart_models_1.default.deleteMany({});
        await expect(transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should find all transactions', async () => {
        await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        const all = await transaction_dao_1.transactionDAO.findAllTransactions();
        expect(Array.isArray(all)).toBe(true);
        expect(all.length).toBeGreaterThan(0);
    });
    it('should find transaction by id', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        const found = await transaction_dao_1.transactionDAO.findTransactionById(tx._id.toString());
        expect(found._id.toString()).toBe(tx._id.toString());
    });
    it('should throw NotFoundError when finding non-existent transaction by id', async () => {
        await expect(transaction_dao_1.transactionDAO.findTransactionById('507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('should find transactions by processed status', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        const unprocessed = await transaction_dao_1.transactionDAO.findTransactionsByProcessed(false);
        expect(unprocessed.map(t => t._id.toString())).toContain(tx._id.toString());
    });
    it('should toggle processed status with updateTransactionById', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        const updated = await transaction_dao_1.transactionDAO.updateTransactionById(tx._id.toString(), { processed: true });
        expect(updated.processed).toBe(true);
    });
    it('should soft delete a transaction', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
        const deleted = await transaction_dao_1.transactionDAO.deleteTransactionById(tx._id.toString());
        expect(deleted.cancelled).toBe(true);
    });
    it('should throw NotFoundError when deleting non-existent transaction', async () => {
        await expect(transaction_dao_1.transactionDAO.deleteTransactionById('507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('should throw ValidationError if transaction with same sessionId exists', async () => {
        const sessionId = `dup-session-${Date.now()}`;
        await transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId);
        await expect(transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should find transaction by sessionId', async () => {
        const sessionId = `session-${Date.now()}`;
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId);
        const found = await transaction_dao_1.transactionDAO.findBySessionId(sessionId);
        expect(found._id.toString()).toBe(tx._id.toString());
    });
    it('should return null if sessionId not found', async () => {
        const found = await transaction_dao_1.transactionDAO.findBySessionId('no-such-session');
        expect(found).toBeNull();
    });
    it('should throw ValidationError if trying to update immutable fields', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        await expect(transaction_dao_1.transactionDAO.updateTransactionById(tx._id, { amount: 999 })).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should throw NotFoundError if participant does not exist when adding transaction', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant('507f1f77bcf86cd799439011', tx._id)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('should throw NotFoundError if transaction does not exist when adding', async () => {
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant(participantId, '507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    // **
    // ---- EXTRA COVERAGE TESTS ----
    it('should throw NotFoundError if participant does not exist when creating transaction', async () => {
        await expect(transaction_dao_1.transactionDAO.createTransaction(new mongoose_2.default.Types.ObjectId().toString(), `sess-${Date.now()}`)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    it('should throw DatabaseError when createTransaction catches unexpected error', async () => {
        // Ensure no duplicate cart
        await cart_models_1.default.deleteMany({ participant: participantId });
        // Create fresh cart
        await cart_models_1.default.create({
            participant: participantId,
            items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 10 }],
        });
        // Mock Transaction.save to throw
        const spy = jest.spyOn(transaction_models_1.default.prototype, 'save').mockRejectedValue(new Error('boom'));
        await expect(transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`)).rejects.toBeInstanceOf(errors_types_1.DatabaseError); // now consistent
        spy.mockRestore();
    });
    it('should throw NotFoundError when updateTransactionById cannot find transaction', async () => {
        await expect(transaction_dao_1.transactionDAO.updateTransactionById('507f1f77bcf86cd799439011', { processed: true })).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
    });
    // it('should throw DatabaseError if updateTransactionById fails unexpectedly', async () => {
    //   const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
    //   // Spy on DAO instead of mongoose internals
    //   const spy = jest.spyOn(transactionDAO as any, 'updateTransactionById').mockRejectedValueOnce(new DatabaseError('forced fail'));
    //   await expect(
    //     transactionDAO.updateTransactionById(tx._id, { processed: true })
    //   ).rejects.toBeInstanceOf(DatabaseError);
    //   spy.mockRestore();
    // });
    it('should throw NotFoundError if Participant.findByIdAndUpdate returns null in addTransactionToParticipant', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        const spy = jest.spyOn(participant_models_1.default, 'findByIdAndUpdate').mockResolvedValueOnce(null);
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant(participantId, tx._id)).rejects.toBeInstanceOf(errors_types_1.NotFoundError);
        spy.mockRestore();
    });
    it('should throw DatabaseError if updateTransactionById fails unexpectedly', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        // Mock findByIdAndUpdate to return a query object with .exec() that rejects
        const spy = jest.spyOn(transaction_models_1.default, 'findByIdAndUpdate').mockReturnValueOnce({
            exec: () => Promise.reject(new Error('boom'))
        });
        await expect(transaction_dao_1.transactionDAO.updateTransactionById(tx._id, { processed: true })).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
        spy.mockRestore();
    });
    it('should throw DatabaseError if deleteTransactionById fails unexpectedly', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        // Same trick for delete
        const spy = jest.spyOn(transaction_models_1.default, 'findByIdAndUpdate').mockReturnValueOnce({
            exec: () => Promise.reject(new Error('boom'))
        });
        await expect(transaction_dao_1.transactionDAO.deleteTransactionById(tx._id)).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
        spy.mockRestore();
    });
    it('should throw ValidationError if transaction with same sessionId exists', async () => {
        const sessionId = `dup-session-${Date.now()}`;
        // First successful transaction
        await transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId);
        // 🔹 Clear cart before re-creating to avoid duplicate key error
        await cart_models_1.default.deleteMany({ participant: participantId });
        // Re-create a fresh cart for the participant
        await cart_models_1.default.create({
            participant: participantId,
            items: [
                {
                    commodity: commodityId,
                    quantity: 1,
                    priceAtPurchase: 50,
                },
            ],
        });
        // Second call with same session → should trigger duplicate-session guard
        await expect(transaction_dao_1.transactionDAO.createTransaction(participantId, sessionId)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
    });
    it('should rethrow as ValidationError when Mongoose throws native ValidationError', async () => {
        // Clear existing cart
        await cart_models_1.default.deleteMany({ participant: participantId });
        // Create a valid cart so DAO passes cart check
        await cart_models_1.default.create({
            participant: participantId,
            items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 10 }],
        });
        // Spy on Transaction.save and force a Mongoose-style validation error
        const err = new Error('bad mongoose validation');
        err.name = 'ValidationError';
        const spy = jest.spyOn(transaction_models_1.default.prototype, 'save').mockRejectedValueOnce(err);
        await expect(transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
        spy.mockRestore();
    });
    it('should rethrow as ValidationError if Mongoose throws ValidationError in addTransactionToParticipant', async () => {
        // Arrange: valid participant + transaction
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        const err = new Error('fake mongoose validation');
        err.name = 'ValidationError';
        const spy = jest
            .spyOn(participant_models_1.default, 'findByIdAndUpdate')
            .mockRejectedValueOnce(err);
        // Act + Assert
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant(participantId, tx._id)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
        spy.mockRestore();
    });
    it('should rethrow as ValidationError if Mongoose throws ValidationError in addTransactionToParticipant', async () => {
        // Arrange: valid participant + transaction
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        const err = new Error('fake mongoose validation');
        err.name = 'ValidationError';
        const spy = jest
            .spyOn(participant_models_1.default, 'findByIdAndUpdate')
            .mockRejectedValueOnce(err);
        // Act + Assert
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant(participantId, tx._id)).rejects.toBeInstanceOf(errors_types_1.ValidationError);
        spy.mockRestore();
    });
    it('should throw DatabaseError if addTransactionToParticipant fails unexpectedly', async () => {
        // Arrange: valid participant + transaction
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        const spy = jest
            .spyOn(participant_models_1.default, 'findByIdAndUpdate')
            .mockRejectedValueOnce(new Error('boom'));
        // Act + Assert
        await expect(transaction_dao_1.transactionDAO.addTransactionToParticipant(participantId, tx._id)).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
        spy.mockRestore();
    });
    it('should throw DatabaseError if findByIdAndUpdate returns null in deleteTransactionById', async () => {
        const tx = await transaction_dao_1.transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
        const spy = jest.spyOn(transaction_models_1.default, 'findByIdAndUpdate').mockResolvedValueOnce(null);
        await expect(transaction_dao_1.transactionDAO.deleteTransactionById(tx._id)).rejects.toBeInstanceOf(errors_types_1.DatabaseError);
        spy.mockRestore();
    });
});
//# sourceMappingURL=transaction.dao.test.js.map