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
export interface TransactionType extends Document {
  _id: Types.ObjectId;
  participant: Types.ObjectId | string | ParticipantType; // links to Participant
  items: CartItemType[];   // reuse the same type
  amount: number; // total
  processed?: boolean;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommodityType extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  category: string[]
  price: number;
  currency: string;
  stripePriceId: string;
  soldCount: number;
  stock: number;
  active: boolean;
  images?: string[];
  comments?: CommentType[];
}

export interface CommentType {
  user: Types.ObjectId | string;
  text: string | EditorJsData;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
  createdAt?: Date;
}

export interface EditorJsData {
  time: number;
  blocks: { type: string; data: unknown }[];
  version: string;
}

export interface CartType {
  _id: Types.ObjectId;
  participant: Types.ObjectId | string | ParticipantType;
  items: CartItemType[];
}

export interface CartItemType {
  commodity: Types.ObjectId | string  | CommodityType;
  quantity: number;
  priceAtPurchase: number;
}