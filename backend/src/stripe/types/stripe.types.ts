import { Types, Document } from 'mongoose';
export interface ParticipantType {
  _id?: Types.ObjectId;
  name?: string;
  surname?: string;
  email: string;
  transactions?: (Types.ObjectId | TransactionType)[]; // array of Transaction IDs or full transaction obj
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TransactionType extends Document{
  _id: Types.ObjectId;
  itemId: Types.ObjectId; // links to object for sale
  amount: number;
  processed?: boolean;
  participant: Types.ObjectId | string | ParticipantType; // links to Participant
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

