// backend\src\login\types\user.types.ts
import { Document, Types } from 'mongoose';
import type { Request } from 'express';
import { CommodityType } from '../../stripe/types/stripe.types';
import type { TransactionType } from '../../stripe/types/stripe.types';

// full mongose obj
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  name?: string;
  email?: string;
  roles: string[];
  hashedPassword: string;
  hasPassword?: boolean;
  favorites?: Types.ObjectId[] | string[]  | CommodityType[];
  // order history
  orderHistory?: (Types.ObjectId | TransactionType)[];
  purchasedProducts?: UserPurchasedProduct[];
  totalSpent?: number;

  createdAt: Date;
  updatedAt: Date;
}

// προσθέτουμε νέα types για την λειτουργία user order history
export interface UserPurchasedProduct {
  uuid: string;
  count: number;
}

export type Roles = 'USER' | 'ADMIN'

// no hashed pass so as user can view
export interface UserView {
  id: string;
  username: string;
  name?: string | undefined;
  email?: string | undefined;
  roles: string[];
  favorites?: Types.ObjectId[] | string[]  | CommodityType[];

  // oreder history
  orderHistory?: (Types.ObjectId | string | TransactionType)[];
  purchasedProducts?: UserPurchasedProduct[];
  totalSpent?: number;

  createdAt: Date;
  updatedAt: Date;
}

// for creating a user with plain password (controller -> service)
export interface CreateUser {
  username: string;
  name?: string;
  email?: string;
  password: string;
  roles?: string[];
}

// for creating a user with a hashed pass
export interface CreateUserHash {
  username: string;
  name?: string;
  email?: string;
  hashedPassword: string;
  roles?: string[];
}

// for updating a user
export interface UpdateUser {
  username?: string
  name?: string;
  roles?: string[];
  password?: string; // optional, will be hashed if present
  hashedPassword?: string;
  favorites?: Types.ObjectId[] | string[] | CommodityType[];
// order history
  orderHistory?: (Types.ObjectId | string)[];
  purchasedProducts?: UserPurchasedProduct[];
  totalSpent?: number;
}

// φτιαχτηκε γιατί το middleware δεν επέτρεπε req: Request
export interface AuthRequest extends Request {
  user?: UserView;
}