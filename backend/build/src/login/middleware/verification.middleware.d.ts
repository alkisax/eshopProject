import type { Response, NextFunction } from 'express';
import type { Roles, AuthRequest } from '../types/user.types';
export declare const middleware: {
    verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    checkRole: (requiredRole: Roles) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
};
