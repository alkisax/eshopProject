import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Transaction from '../models/transaction.models';
import Participant from '../models/participant.models';
import Commodity from '../models/commodity.models';
import Cart from '../models/cart.models';
import { transactionDAO } from '../daos/transaction.dao';
import { NotFoundError, ValidationError, DatabaseError } from '../types/errors.types';
// import { DatabaseError } from '../types/errors.types';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await connect(process.env.MONGODB_TEST_URI);
});

afterAll(async () => {
  await Transaction.deleteMany({});
  await Participant.deleteMany({});
  await Commodity.deleteMany({});
  await Cart.deleteMany({});
  await disconnect();
});

describe('transactionDAO', () => {
  let participantId: string;
  let commodityId: string;

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await Participant.deleteMany({});
    await Commodity.deleteMany({});
    await Cart.deleteMany({});

    // Create participant
    const participant = await Participant.create({
      name: 'TxUser',
      surname: 'Test',
      email: `txuser_${Date.now()}@example.com`,
      transactions: []
    });
    participantId = participant._id.toString();

    // Create commodity
    const commodity = await Commodity.create({
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
    await Cart.create({
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
    const tx = await transactionDAO.createTransaction(
      participantId,
      `test-session-${Date.now()}`
    );
    expect(tx.participant.toString()).toBe(participantId);
    expect(tx.items.length).toBe(1);
    expect(tx.amount).toBe(100); // 2 * 50
  });

  it('should throw ValidationError if cart is empty', async () => {
    await Cart.deleteMany({});
    await expect(
      transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`)
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should find all transactions', async () => {
    await transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
    const all = await transactionDAO.findAllTransactions();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it('should find transaction by id', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
    const found = await transactionDAO.findTransactionById(tx._id.toString());
    expect(found._id.toString()).toBe(tx._id.toString());
  });

  it('should throw NotFoundError when finding non-existent transaction by id', async () => {
    await expect(
      transactionDAO.findTransactionById('507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should find transactions by processed status', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
    const unprocessed = await transactionDAO.findTransactionsByProcessed(false);
    expect(unprocessed.map(t => t._id.toString())).toContain(tx._id.toString());
  });

  it('should toggle processed status with updateTransactionById', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
    const updated = await transactionDAO.updateTransactionById(tx._id.toString(), { processed: true });
    expect(updated.processed).toBe(true);
  });

  it('should soft delete a transaction', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `test-session-${Date.now()}`);
    const deleted = await transactionDAO.deleteTransactionById(tx._id.toString());
    expect(deleted.cancelled).toBe(true);
  });

  it('should throw NotFoundError when deleting non-existent transaction', async () => {
    await expect(
      transactionDAO.deleteTransactionById('507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw ValidationError if transaction with same sessionId exists', async () => {
    const sessionId = `dup-session-${Date.now()}`;
    await transactionDAO.createTransaction(participantId, sessionId);
    await expect(
      transactionDAO.createTransaction(participantId, sessionId)
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should find transaction by sessionId', async () => {
    const sessionId = `session-${Date.now()}`;
    const tx = await transactionDAO.createTransaction(participantId, sessionId);
    const found = await transactionDAO.findBySessionId(sessionId);
    expect(found!._id.toString()).toBe(tx._id.toString());
  });

  it('should return null if sessionId not found', async () => {
    const found = await transactionDAO.findBySessionId('no-such-session');
    expect(found).toBeNull();
  });

  it('should throw ValidationError if trying to update immutable fields', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
    await expect(
      transactionDAO.updateTransactionById(tx._id, { amount: 999 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should throw NotFoundError if participant does not exist when adding transaction', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
    await expect(
      transactionDAO.addTransactionToParticipant('507f1f77bcf86cd799439011', tx._id)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw NotFoundError if transaction does not exist when adding', async () => {
    await expect(
      transactionDAO.addTransactionToParticipant(participantId, '507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });
  // **
  // ---- EXTRA COVERAGE TESTS ----

  it('should throw NotFoundError if participant does not exist when creating transaction', async () => {
    await expect(
      transactionDAO.createTransaction(new mongoose.Types.ObjectId().toString(), `sess-${Date.now()}`)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw DatabaseError when createTransaction catches unexpected error', async () => {
    // Ensure no duplicate cart
    await Cart.deleteMany({ participant: participantId });

    // Create fresh cart
    await Cart.create({
      participant: participantId,
      items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 10 }],
    });

    // Mock Transaction.save to throw
    const spy = jest.spyOn(Transaction.prototype, 'save').mockRejectedValue(new Error('boom'));

    await expect(
      transactionDAO.createTransaction(participantId, `sess-${Date.now()}`)
    ).rejects.toBeInstanceOf(DatabaseError);   // now consistent

    spy.mockRestore();
  });

  it('should throw NotFoundError when updateTransactionById cannot find transaction', async () => {
    await expect(
      transactionDAO.updateTransactionById('507f1f77bcf86cd799439011', { processed: true })
    ).rejects.toBeInstanceOf(NotFoundError);
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
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);
    const spy = jest.spyOn(Participant, 'findByIdAndUpdate').mockResolvedValueOnce(null);

    await expect(
      transactionDAO.addTransactionToParticipant(participantId, tx._id)
    ).rejects.toBeInstanceOf(NotFoundError);

    spy.mockRestore();
  });

  it('should throw DatabaseError if updateTransactionById fails unexpectedly', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    // Mock findByIdAndUpdate to return a query object with .exec() that rejects
    const spy = jest.spyOn(Transaction, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: () => Promise.reject(new Error('boom'))
    } as unknown as ReturnType<typeof Transaction.findByIdAndUpdate>);

    await expect(
      transactionDAO.updateTransactionById(tx._id, { processed: true })
    ).rejects.toBeInstanceOf(DatabaseError);

    spy.mockRestore();
  });

  it('should throw DatabaseError if deleteTransactionById fails unexpectedly', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    // Same trick for delete
    const spy = jest.spyOn(Transaction, 'findByIdAndUpdate').mockReturnValueOnce({
      exec: () => Promise.reject(new Error('boom'))
    } as unknown as ReturnType<typeof Transaction.findByIdAndUpdate>);

    await expect(
      transactionDAO.deleteTransactionById(tx._id)
    ).rejects.toBeInstanceOf(DatabaseError);

    spy.mockRestore();
  });

  it('should throw ValidationError if transaction with same sessionId exists', async () => {
    const sessionId = `dup-session-${Date.now()}`;

    // First successful transaction
    await transactionDAO.createTransaction(participantId, sessionId);

    // 🔹 Clear cart before re-creating to avoid duplicate key error
    await Cart.deleteMany({ participant: participantId });

    // Re-create a fresh cart for the participant
    await Cart.create({
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
    await expect(
      transactionDAO.createTransaction(participantId, sessionId)
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should rethrow as ValidationError when Mongoose throws native ValidationError', async () => {
    // Clear existing cart
    await Cart.deleteMany({ participant: participantId });

    // Create a valid cart so DAO passes cart check
    await Cart.create({
      participant: participantId,
      items: [{ commodity: commodityId, quantity: 1, priceAtPurchase: 10 }],
    });

    // Spy on Transaction.save and force a Mongoose-style validation error
    const err = new Error('bad mongoose validation');
    err.name = 'ValidationError';
    const spy = jest.spyOn(Transaction.prototype, 'save').mockRejectedValueOnce(err);

    await expect(
      transactionDAO.createTransaction(participantId, `sess-${Date.now()}`)
    ).rejects.toBeInstanceOf(ValidationError);

    spy.mockRestore();
  });

  it('should rethrow as ValidationError if Mongoose throws ValidationError in addTransactionToParticipant', async () => {
    // Arrange: valid participant + transaction
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    const err = new Error('fake mongoose validation');
    err.name = 'ValidationError';

    const spy = jest
      .spyOn(Participant, 'findByIdAndUpdate')
      .mockRejectedValueOnce(err);

    // Act + Assert
    await expect(
      transactionDAO.addTransactionToParticipant(participantId, tx._id)
    ).rejects.toBeInstanceOf(ValidationError);

    spy.mockRestore();
  });

  it('should rethrow as ValidationError if Mongoose throws ValidationError in addTransactionToParticipant', async () => {
    // Arrange: valid participant + transaction
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    const err = new Error('fake mongoose validation');
    err.name = 'ValidationError';

    const spy = jest
      .spyOn(Participant, 'findByIdAndUpdate')
      .mockRejectedValueOnce(err);

    // Act + Assert
    await expect(
      transactionDAO.addTransactionToParticipant(participantId, tx._id)
    ).rejects.toBeInstanceOf(ValidationError);

    spy.mockRestore();
  });

  it('should throw DatabaseError if addTransactionToParticipant fails unexpectedly', async () => {
    // Arrange: valid participant + transaction
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    const spy = jest
      .spyOn(Participant, 'findByIdAndUpdate')
      .mockRejectedValueOnce(new Error('boom'));

    // Act + Assert
    await expect(
      transactionDAO.addTransactionToParticipant(participantId, tx._id)
    ).rejects.toBeInstanceOf(DatabaseError);

    spy.mockRestore();
  });

  it('should throw DatabaseError if findByIdAndUpdate returns null in deleteTransactionById', async () => {
    const tx = await transactionDAO.createTransaction(participantId, `sess-${Date.now()}`);

    const spy = jest.spyOn(Transaction, 'findByIdAndUpdate').mockResolvedValueOnce(null);

    await expect(
      transactionDAO.deleteTransactionById(tx._id)
    ).rejects.toBeInstanceOf(DatabaseError);

    spy.mockRestore();
  });


});
