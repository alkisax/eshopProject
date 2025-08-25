const Participant = require('../models/participant.models');

const findAllParticipants = async () => {
  return await Participant.find().populate('transactions');
};

const findParticipantByEmail = async (email) => {
  return await Participant.findOne({ email }).populate('transactions');
};

const createParticipant = async (participantData) => {
  const participant = new Participant(participantData);
  return await participant.save();
};

const deleteParticipantById = async (participantId) => {
  return await Participant.findByIdAndDelete(participantId);
};

const addTransactionToParticipant = async (participantId, transactionId) => {
  return await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  );
};

module.exports = {
  findAllParticipants,
  findParticipantByEmail,
  createParticipant,
  deleteParticipantById,
  addTransactionToParticipant
};