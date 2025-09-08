import type { Request, Response } from 'express';
export declare const commodityController: {
    findAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllCategories: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    sellById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    clearComments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
