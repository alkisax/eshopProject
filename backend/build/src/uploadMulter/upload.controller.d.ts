import type { Request, Response } from 'express';
export declare const uploadController: {
    renderUploadPage: (_req: Request, res: Response) => Promise<void>;
    uploadFile: (req: Request, res: Response) => Promise<Response>;
    deleteUpload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
