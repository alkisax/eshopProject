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
  shipping?: ShippingInfoType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShippingInfoType {
  shippingEmail: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  notes?: string;
  shippingMethod?: "courier" | "boxnow" | "pickup";
}

export interface CommodityType {
  _id: string;
  uuid?: string;
  slug?: string;
  name: string;
  description?: string;
  details?: string;
  tips?: string;
  category: string | string[] | { _id: string; name: string; slug: string };
  price: number;
  currency: string;
  stripePriceId: string;
  soldCount: number;
  stock: number;
  active: boolean;
  variants?: CommodityVariantType[];
  requiresProcessing?: boolean;
  processingTimeDays?: number;
  images?: string[];
  vector?: number[];
  comments?: CommentType[];
  createdAt?: Date;
  updatedAt?: Date;
}

// προσθήκη για την περίπτωση που έχουμε εμπορευματα με ιδιότητες πχ μεγεθος χρωμα σε μπλουζάκι

export type VariantAttributeValue = string;

export type VariantAttributes = Record<string, VariantAttributeValue>;

export interface CommodityVariantType {
  _id?: string;
  attributes: VariantAttributes;
  stock?: number;
  sku?: string;
  active?: boolean;
}

export interface CommentType {
  _id: string; // commodity id
  commentId?: string; // comment id
  commodity?: {
    _id: string;
    name: string;
  };
  commodityId?: string;
  commodityName?: string;
  user: string | IUser;
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
  variantId: string;
}

export interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | { _id: string; name: string; slug: string }; // can be populated
  children?: string[];
  isTag?: boolean;
  featured?: boolean;
  image?: string;
  order?: number;
  active: boolean;
}
