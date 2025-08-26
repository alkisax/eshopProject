import Participant from '../models/participant.models';
import type { ParticipantType, TransactionType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, DatabaseError } from '../types/errors.types';

// create 
const createParticipant = async (participantData: ParticipantType) => {
  const existing = await Participant.findOne({ email: participantData.email });
  if (existing) {
    throw new ValidationError('Participant with this email already exists');
  }

  const participant = new Participant({
    name: participantData.name,
    surname: participantData.surname,
    email: participantData.email,
    // transactions: participantData.transactions
    transactions: []
  });

  try{
    const response = await participant.save();
    if (!response) {
      throw new DatabaseError('error saving participant');
    }
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message); // will map to 400
    }
    throw new DatabaseError('Unexpected error saving participant');   
  } 
};

//read 
const findAllParticipants = async (page = 0): Promise<ParticipantType[]> => {
  // const response =  await Participant.find().populate<{ transactions: TransactionType[] }>('transactions').limit(50).skip(page * 50);

  const response =  await Participant.find().limit(50).skip(page * 50);
  return response;
};

const findParticipantByEmail = async (email: string): Promise<ParticipantType> => {
  // const response =  await Participant.findOne({ email }).populate<{ transactions: TransactionType[] }>('transactions');
  const response =  await Participant.findOne({ email });

  if (!response) {
    throw new NotFoundError('Participant does not exist');
  }
  return response;
};

const findParticipantById = async (id: string): Promise<ParticipantType> => {
  // const response = await Participant.findById(id).populate<{ transactions: TransactionType[] }>('transactions');
  const response = await Participant.findById(id);

  if (!response) {
    throw new NotFoundError('Participant does not exist');
  }
  return response;
};

const updateParticipantById = async (
  id: string,
  updateData: Partial<ParticipantType>
): Promise<ParticipantType> => {
  // Disallow email updates
  const { email, ...allowedData } = updateData;
  if (email) {
    throw new ValidationError('Email cannot be updated');
  }

  // const response = await Participant.findByIdAndUpdate(id, allowedData, { new: true }).populate<{ transactions: TransactionType[] }>('transactions');
  const response = await Participant.findByIdAndUpdate(id, allowedData, { new: true });
  if (!response) {
    throw new NotFoundError('Participant not found');
  }
  return response;
};


const deleteParticipantById = async (id: string): Promise<ParticipantType> => {
  const response = await Participant.findByIdAndDelete(id);
  if (!response) {
    throw new NotFoundError('Participant not found');
  }
  return response;
};

const addTransactionToParticipant = async (participantId: Types.ObjectId, transactionId: Types.ObjectId): Promise<ParticipantType> => {
  const response =  await Participant.findByIdAndUpdate(
    participantId,
    { $push: { transactions: transactionId } },
    { new: true }
  ).populate<{ transactions: TransactionType[] }>('transactions');
  
  if (!response) {
    throw new NotFoundError('Participant not found');
  }

  return response;
};

export const participantDao = {
  createParticipant,
  findAllParticipants,
  findParticipantByEmail,
  findParticipantById,
  updateParticipantById,
  deleteParticipantById,
  addTransactionToParticipant,
};