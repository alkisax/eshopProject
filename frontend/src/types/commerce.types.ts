import type { IUser } from "./types";

export interface ParticipantType {
  _id?: string;
  name?: string;
  surname?: string;
  email: string;
  user?: string | IUser;
  transactions?: (string | TransactionType)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionType {
  _id: string;
  participant: string | ParticipantType;
  items: CartItemType[];
  amount: number;
  processed?: boolean;
  cancelled?: boolean;
  sessionId?: string;
  shipping?: ShippingInfoType;   // ✅ add this
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShippingInfoType {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  notes?: string;
}

export interface CommodityType {
  _id: string;
  name: string;
  description?: string;
  category: string[];
  price: number;
  currency: string;
  stripePriceId: string;
  soldCount: number;
  stock: number;
  active: boolean;
  images?: string[];
  comments?: CommentType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentType {
  _id?: string;
  user: string;
  text: string | EditorJsData;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
  isApproved?: boolean;
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
  commodity: CommodityType;
  quantity: number;
  priceAtPurchase: number;
}

export interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  children?: string[]; 
  isTag?: boolean;
  featured?: boolean;
  image?: string;
  order?: number;
  active: boolean;
}