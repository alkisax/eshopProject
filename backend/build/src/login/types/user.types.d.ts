import { Document, Types } from 'mongoose';
import type { Request } from 'express';
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    name?: string;
    email?: string;
    roles: string[];
    hashedPassword: string;
    hasPassword?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type Roles = 'USER' | 'ADMIN';
export interface UserView {
    id: string;
    username: string;
    name?: string | undefined;
    email?: string | undefined;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUser {
    username: string;
    name?: string;
    email?: string;
    password: string;
    roles?: string[];
}
export interface CreateUserHash {
    username: string;
    name?: string;
    email?: string;
    hashedPassword: string;
    roles?: string[];
}
export interface UpdateUser {
    username?: string;
    name?: string;
    roles?: string[];
    password?: string;
    hashedPassword?: string;
}
export interface AuthRequest extends Request {
    user?: UserView;
}
