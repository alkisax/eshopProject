import type { JwtPayload } from 'jsonwebtoken';
import type { Request } from 'express';
import type { IUser } from '../types/user.types';
type VerifyAccessTokenResult = {
    verified: true;
    data: string | JwtPayload;
} | {
    verified: false;
    data: string;
};
export declare const authService: {
    generateAccessToken: (user: IUser) => string;
    verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
    verifyAccessToken: (token: string) => VerifyAccessTokenResult;
    verifyAndFetchUser: (token: string) => Promise<{
        verified: boolean;
        reason: string;
        user?: undefined;
    } | {
        verified: boolean;
        user: import("../types/user.types").UserView;
        reason?: undefined;
    }>;
    getTokenFrom: (req: Request) => string | null;
    googleAuth: (code: string, redirectUri: string) => Promise<{
        user: import("google-auth-library").TokenPayload | undefined;
        tokens: import("google-auth-library").Credentials;
        error?: undefined;
    } | {
        error: string;
        user?: undefined;
        tokens?: undefined;
    }>;
};
export {};
