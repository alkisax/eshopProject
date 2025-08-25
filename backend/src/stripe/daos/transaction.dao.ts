import Transaction from '../models/transaction.models';
import Participant from '../models/participant.models';
import { NotFoundError } from '../types/errors.types';
import type { TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';

// Find all transactions
const findAllTransactions = async () => {
  return await Transaction.find().populate('participant');
};

// Find transaction by ID
const findTransactionById = async (transactionId: string): Promise<TransactionType> => {
  const response = await Transaction.findById(transactionId).populate('participant');
  if (!response) {
    throw new NotFoundError('Transaction does not exist');
  }
  return response;
};

// Create a new transaction
const createTransaction = async (transactionData: TransactionType) => {
  const transaction = new Transaction(transactionData);
  return await transaction.save();
};

// Delete a transaction by ID
const deleteTransactionById = async (transactionId: string) => {
  return await Transaction.findByIdAndDelete(transactionId);
};

// Update a transaction (for example, changing the amount)
const updateTransactionById = async (transactionId: string, updatedData: Partial<TransactionType>) => {
  return await Transaction.findByIdAndUpdate(
    transactionId,
    updatedData,
    { new: true } // return the updated document
  );
};

const findTransactionsByProcessed = async (isProcessed: boolean) => {
  return await Transaction.find({ processed: isProcessed }).populate('participant');
};

const addTransactionToParticipant = async (participantId: string | Types.ObjectId, transactionId: string | Types.ObjectId) => {
  return await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  ); //"Find the participant and push this new transactionId into their transactions array."
};

const findBySessionId = async (sessionId: string) => {
  return await Transaction.findOne({ sessionId });
};

export const transactionDAO = {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  deleteTransactionById,
  updateTransactionById,
  findTransactionsByProcessed,
  findBySessionId,
  addTransactionToParticipant
};
