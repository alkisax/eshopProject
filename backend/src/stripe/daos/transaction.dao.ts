import Transaction from '../models/transaction.models';
import Participant from '../models/participant.models';
import type { TransactionType, ParticipantType } from '../types/stripe.types';
import { NotFoundError, ValidationError, DatabaseError } from '../types/errors.types';

import { Types } from 'mongoose';

// Create a new transaction
const createTransaction = async (transactionData: Partial<TransactionType>): Promise<TransactionType> => {

  // const existing = await Transaction.findById(transactionData._id);
  // if (existing) {
  //   throw new ValidationError('Transaction with this id already exists');
  // }

  const transaction = new Transaction(transactionData);
  try {
    const result = await transaction.save();
    return result;    
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('error saving transaction');
  }
};

// Find all transactions
const findAllTransactions = async (): Promise<TransactionType[]> => {
  return await Transaction.find().populate<{ participant: ParticipantType }>('participant');
};

// Find transaction by ID
const findTransactionById = async (transactionId: string | Types.ObjectId): Promise<TransactionType> => {
  const response = await Transaction.findById(transactionId).populate<{ participant: ParticipantType }>('participant');
  if (!response) {
    throw new NotFoundError('Transaction does not exist');
  }
  return response;
};

// I dont know what this is. i copy pasted it from another app. ill leave it commented out
// const findBySessionId = async (sessionId: string | Types.ObjectId): Promise<TransactionType> => {
//   const response =  await Transaction.findOne({ sessionId });
//   if (!response) {
//     throw new NotFoundError('Transaction does not exist');
//   }
//   return response;
// };

const findTransactionsByProcessed = async (isProcessed: boolean): Promise<TransactionType[]> => {
  const response =  await Transaction.find({ processed: isProcessed }).populate<{ participant: ParticipantType }>('participant');
  // if (response.length === 0) {
  //   throw new NotFoundError('No transaction is processed');
  // }
  return response;
};

// Update a transaction (for example, changing the amount)
const updateTransactionById = async (transactionId: string | Types.ObjectId, updatedData: Partial<TransactionType>): Promise<TransactionType> => {
  try {
    const response = await Transaction.findByIdAndUpdate(transactionId, updatedData, { new: true, runValidators: true });
    if (!response) {
      throw new NotFoundError('transaction with this id does not exist');
    }
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('error updating transaction');
  }
};

const addTransactionToParticipant = async (participantId: string | Types.ObjectId, transactionId: string | Types.ObjectId): Promise<ParticipantType> => {
  const existingParticipant = await Participant.findById(participantId);
  const existingTransaction = await Transaction.findById(transactionId);
  if ( !existingParticipant || !existingTransaction) {
    throw new NotFoundError('partisipant or transaction 404');
  }

  const response = await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  ); //"Find the participant and push this new transactionId into their transactions array."
  if (!response) {
    throw new NotFoundError('Participant 404');
  }
  return response;
};

// Delete a transaction by ID
const deleteTransactionById = async (transactionId: string): Promise<TransactionType> => {
  const existing = await Transaction.findById(transactionId);
  if (!existing) {
    throw new NotFoundError('transaction 404');
  }
  
  try {
    const response = await Transaction.findByIdAndDelete(transactionId);
    if (!response) {
      throw new DatabaseError('error deleting transaction');
    }
    return response;
  } catch {
    throw new DatabaseError('error deleting transaction');
  }
};

export const transactionDAO = {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  deleteTransactionById,
  updateTransactionById,
  findTransactionsByProcessed,
  // findBySessionId,
  addTransactionToParticipant
};
