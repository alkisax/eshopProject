import type { Request, Response } from 'express';
export declare const syncUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const authAppwriteController: {
    syncUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
