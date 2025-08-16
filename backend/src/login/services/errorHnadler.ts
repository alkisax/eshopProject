// src/utils/errorHandler.ts
import type { Response } from 'express';
import { ZodError } from 'zod';

export function handleControllerError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ status: false, errors: error.issues });
  }
  if (error instanceof Error) {
    console.error(error);
    const statusCode = (error as any).status || 500;
    return res.status(statusCode).json({ status: false, error: error.message });
  }
  return res.status(500).json({ status: false, error: 'Unknown error' });
}


