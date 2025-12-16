// backend\src\stripe\types\stripe.types.ts
import mongoose, { Types, Document } from 'mongoose';
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
  uuid?: string;
  slug?: string;
  sku?: string;
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
  variants?: CommodityVariantType[];
  vector?: number[]; // για προσθήκη vector embedings
  createdAt?: Date;
  updatedAt?: Date;
}

// προσθήκη για την περίπτωση που έχουμε εμπορευματα με ιδιότητες πχ μεγεθος χρωμα σε μπλουζάκι

export type VariantAttributeValue = string;

export type VariantAttributes = Record<string, VariantAttributeValue>;

export interface CommodityVariantType {
  _id?: Types.ObjectId;
  attributes: VariantAttributes;
  stock?: number;
  sku?: string;
  active?: boolean;
}

export interface CommentType {
  _id?: Types.ObjectId
  user: Types.ObjectId | string;
  text: string | EditorJsData;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
  isApproved?: boolean,
  createdAt?: Date;
  updatedAt?: Date;
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
  variantId?: Types.ObjectId;
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
  shippingMethod?: 'courier' | 'boxnow' | 'pickup';
}

export interface CategoryType extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  children?: mongoose.Types.ObjectId[]; 
  isTag?: boolean;      // treat like a minor category
  featured?: boolean;
  image?: string;
  order?: number;
  active: boolean;
}