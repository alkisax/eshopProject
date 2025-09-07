import type { Request, Response } from 'express';
import type { AuthRequest } from '../../login/types/user.types';
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const findAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const findByEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const findById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const participantController: {
    create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    findAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findByEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteOldGuestParticipants: (_req: Request, res: Response) => Promise<void>;
};
