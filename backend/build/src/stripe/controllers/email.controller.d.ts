import type { Request, Response } from 'express';
export declare const emailController: {
    sendThnxEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
