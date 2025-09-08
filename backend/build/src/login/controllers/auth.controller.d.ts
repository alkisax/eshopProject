import type { Request, Response } from 'express';
import { AuthRequest } from '../types/user.types';
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getGoogleOAuthUrlLogin: (_req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const getGoogleOAuthUrlSignup: (_req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const googleCallback: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const googleLogin: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const googleSignup: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const githubCallback: (_req: Request, res: Response) => Promise<void>;
export declare const authController: {
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getGoogleOAuthUrlLogin: (_req: Request, res: Response) => Response<any, Record<string, any>>;
    getGoogleOAuthUrlSignup: (_req: Request, res: Response) => Response<any, Record<string, any>>;
    googleLogin: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
    googleSignup: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
    githubCallback: (_req: Request, res: Response) => Promise<void>;
};
