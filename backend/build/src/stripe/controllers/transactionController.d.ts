import type { Request, Response } from 'express';
export declare const transactionController: {
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findAll: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findUnprocessed: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findByParticipant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    toggleProcessed: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteOldProcessedTransactions: (_req: Request, res: Response) => Promise<void>;
};
