import type { IUser, UserView, CreateUserHash, UpdateUser } from '../types/user.types';
export declare const toUserDAO: (user: IUser) => UserView;
export declare const userDAO: {
    toUserDAO: (user: IUser) => UserView;
    create: (userData: CreateUserHash) => Promise<UserView>;
    readAll: () => Promise<UserView[]>;
    readById: (userId: string) => Promise<UserView>;
    readByUsername: (username: string) => Promise<UserView>;
    toServerById: (userId: string) => Promise<IUser>;
    toServerByEmail: (email: string) => Promise<IUser | null>;
    toServerbyUsername: (username: string) => Promise<IUser | null>;
    update: (userId: string, userData: UpdateUser) => Promise<UserView>;
    toggleRoleById: (userId: string) => Promise<UserView | null>;
    deleteById: (userId: string) => Promise<UserView>;
};
