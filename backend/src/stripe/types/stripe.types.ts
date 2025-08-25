import type { Types } from 'mongoose';
export interface ParticipantType {
  _id?: Types.ObjectId;
  name?: string;
  surname?: string;
  email: string;
  transactions?: Types.ObjectId[]; // array of Transaction IDs
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TransactionType {
  _id?: Types.ObjectId;
  amount: number;
  processed?: boolean;
  participant: Types.ObjectId; // links to Participant
  createdAt?: Date;
  updatedAt?: Date;
}
