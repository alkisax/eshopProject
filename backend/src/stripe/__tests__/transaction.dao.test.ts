import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Transaction from '../models/transaction.models';
import Participant from '../models/participant.models';
import { transactionDAO } from '../daos/transaction.dao';
import { NotFoundError, ValidationError } from '../types/errors.types';

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await connect(process.env.MONGODB_TEST_URI);
  await Transaction.deleteMany({});
  await Participant.deleteMany({});
});

afterAll(async () => {
  await Transaction.deleteMany({});
  await Participant.deleteMany({});
  await disconnect();
});

describe('transactionDAO', () => {
  let participantId: string;

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await Participant.deleteMany({});
    const participant = await Participant.create({
      name: 'TxUser',
      surname: 'Test',
      email: `txuser_${Date.now()}@example.com`,
      transactions: []
    });
    participantId = participant._id.toString();
  });

  it('should create a transaction successfully', async () => {
    const tx = await transactionDAO.createTransaction({
      amount: 100,
      participant: participantId
    });
    expect(tx.amount).toBe(100);
    expect(tx.participant.toString()).toBe(participantId);
  });

  it('should throw ValidationError if mongoose validation fails', async () => {
    // amount is required, so this should throw
    await expect(
      transactionDAO.createTransaction({ participant: participantId } as any)
    ).rejects.toBeInstanceOf(ValidationError); // depending on your error mapping
  });

  it('should find all transactions', async () => {
    await transactionDAO.createTransaction({ amount: 50, participant: participantId });
    const all = await transactionDAO.findAllTransactions();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it('should find transaction by id', async () => {
    const tx = await transactionDAO.createTransaction({ amount: 200, participant: participantId });
    const found = await transactionDAO.findTransactionById(tx._id.toString());
    expect(found._id.toString()).toBe(tx._id.toString());
  });

  it('should throw NotFoundError when finding non-existent transaction by id', async () => {
    await expect(
      transactionDAO.findTransactionById('507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should find transactions by processed status', async () => {
    await transactionDAO.createTransaction({ amount: 123, participant: participantId, processed: false });
    const unprocessed = await transactionDAO.findTransactionsByProcessed(false);
    expect(unprocessed.some(t => t.processed === false)).toBe(true);
  });

  it('should update a transaction', async () => {
    const tx = await transactionDAO.createTransaction({ amount: 10, participant: participantId });
    const updated = await transactionDAO.updateTransactionById(tx._id.toString(), { amount: 99 });
    expect(updated.amount).toBe(99);
  });

  it('should add transaction to participant', async () => {
    const tx = await transactionDAO.createTransaction({ amount: 33, participant: participantId });
    const updatedParticipant = await transactionDAO.addTransactionToParticipant(participantId, tx._id);
    expect(updatedParticipant.transactions!.map(t => t.toString())).toContain(tx._id.toString());
  });

  it('should throw NotFoundError if participant or transaction missing when adding', async () => {
    const tx = await transactionDAO.createTransaction({ amount: 77, participant: participantId });
    await expect(
      transactionDAO.addTransactionToParticipant('507f1f77bcf86cd799439011', tx._id)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should delete a transaction by id', async () => {
    const tx = await transactionDAO.createTransaction({ amount: 5, participant: participantId });
    const deleted = await transactionDAO.deleteTransactionById(tx._id.toString());
    expect(deleted._id.toString()).toBe(tx._id.toString());
  });

  it('should throw NotFoundError when deleting non-existent transaction', async () => {
    await expect(
      transactionDAO.deleteTransactionById('507f1f77bcf86cd799439011')
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
