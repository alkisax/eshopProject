// import { Types, Document } from 'mongoose';
import type { IUser } from './types';

export interface ParticipantType {
  _id?: string;
  name?: string;
  surname?: string;
  email: string;
  user?: string | IUser;
  transactions?: (string | TransactionType)[]; // array of Transaction IDs or full transaction obj
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TransactionType {
  _id: string;
  participant: string | ParticipantType; // links to Participant
  items: CartItemType[];   // reuse the same type
  amount: number; // total
  processed?: boolean;
  cancelled?: boolean;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommodityType {
  _id: string;
  name: string;
  description?: string;
  category: string[]
  price: number; //must be /100 to be in euro cents
  currency: string;
  stripePriceId: string;
  soldCount: number;
  stock: number;
  active: boolean;
  images?: string[];
  comments?: CommentType[];
}

export interface CommentType {
  _id?: string
  user: string;
  text: string | EditorJsData;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
  isApproved?: boolean,
  createdAt?: Date;
}

export interface EditorJsData {
  time: number;
  blocks: { type: string; data: unknown }[];
  version: string;
}

export interface CartType {
  _id: string;
  participant: string | ParticipantType;
  items: CartItemType[];
}

export interface CartItemType {
  commodity: string | CommodityType;
  quantity: number;
  priceAtPurchase: number;
}