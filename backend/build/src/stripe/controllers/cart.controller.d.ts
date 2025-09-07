import type { Request, Response } from 'express';
export declare const cartController: {
    getCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllCarts: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addOrRemoveItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateQuantity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    clearCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteOldCarts: (_req: Request, res: Response) => Promise<void>;
};
