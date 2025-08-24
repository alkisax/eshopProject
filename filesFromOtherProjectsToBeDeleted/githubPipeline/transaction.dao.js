const Transaction = require('../models/transaction.models');
const Participant = require('../models/participant.models')

// Find all transactions
const findAllTransactions = async () => {
  return await Transaction.find().populate('participant');
};

// Find transaction by ID
const findTransactionById = async (transactionId) => {
  return await Transaction.findById(transactionId).populate('participant');
};

// Create a new transaction
const createTransaction = async (transactionData) => {
  const transaction = new Transaction(transactionData);
  return await transaction.save();
};

// Delete a transaction by ID
const deleteTransactionById = async (transactionId) => {
  return await Transaction.findByIdAndDelete(transactionId);
};

// Update a transaction (for example, changing the amount)
const updateTransactionById = async (transactionId, updatedData) => {
  return await Transaction.findByIdAndUpdate(
    transactionId,
    updatedData,
    { new: true } // return the updated document
  );
};

const findTransactionsByProcessed = async (isProcessed) => {
  return await Transaction.find({ processed: isProcessed }).populate('participant');
};

const addTransactionToParticipant = async (participantId, transactionId) => {
  return await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  ); //"Find the participant and push this new transactionId into their transactions array."
};

const findBySessionId = async (sessionId) => {
  return await Transaction.findOne({ sessionId });
};

module.exports = {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  deleteTransactionById,
  updateTransactionById,
  findTransactionsByProcessed,
  findBySessionId
};
