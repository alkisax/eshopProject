/* eslint-disable no-console */
// src/utils/errorHandler.ts
import type { Response } from 'express';
import type { AppError } from '../stripe/types/errors.types';

export function handleControllerError(res: Response, error: unknown) {

  if (error instanceof Error) {
    console.error(error);

    const statusCode = (error as AppError).statusCode !== undefined ? 
      (error as AppError).statusCode : 500;

    return res.status(statusCode).json({ status: false, message: error.message });
  }
  return res.status(500).json({ status: false, error: 'Unknown error' });
}


