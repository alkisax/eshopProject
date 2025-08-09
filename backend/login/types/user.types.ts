import { Document, Types } from "mongoose";

// full mongose obj
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  name?: string;
  email?: string;
  roles: string[];
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

// no hashed pass so as user can view
export interface UserView {
  id: string;
  username: string;
  name?: string | undefined;
  email?: string | undefined;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
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
  name?: string;
  email?: string;
  roles?: string[];
  password?: string; // optional, will be hashed if present
}