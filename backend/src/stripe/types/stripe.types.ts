import { Types, Document } from 'mongoose';
import { IUser } from '../../login/types/user.types';
export interface ParticipantType {
  _id?: Types.ObjectId;
  name?: string;
  surname?: string;
  email: string;
  user?: Types.ObjectId | string | IUser;
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
  cancelled?: boolean;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommodityType extends Document {
  _id: Types.ObjectId;
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
  _id?: Types.ObjectId
  user: Types.ObjectId | string;
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
  _id: Types.ObjectId;
  participant: Types.ObjectId | string | ParticipantType;
  items: CartItemType[];
}

export interface CartItemType {
  commodity: Types.ObjectId | string  | CommodityType;
  quantity: number;
  priceAtPurchase: number;
}

export interface lineItemsType {
  price: string;
  quantity: number;
}

export interface ShippingInfoType {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  shippingEmail: string;
  phone?: string;
  notes?: string;
}