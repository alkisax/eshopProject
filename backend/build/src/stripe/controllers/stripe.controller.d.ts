import type { Request, Response } from 'express';
export declare const stripeController: {
    createCheckoutSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    handleSuccess: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
    handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    handleCancel: (_req: Request, res: Response) => Response<any, Record<string, any>>;
};
