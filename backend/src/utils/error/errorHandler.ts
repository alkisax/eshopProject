/* eslint-disable no-console */
// src/utils/errorHandler.ts
import type { Response } from 'express';
import { ZodError } from 'zod';
import { BadRequestError, DatabaseError, NotFoundError, ValidationError } from './errors.types';

interface HttpError extends Error {
  status?: number;
}

export function handleControllerError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      details: error.issues,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: false,
      message: error.message || 'Database error',
    });
  }

  if (error instanceof Error) {
    console.error(error);

    const httpError = error as HttpError;
    const statusCode = httpError.status ?? 500;

    return res
      .status(statusCode)
      .json({ status: false, message: error.message });
  }

  if (error instanceof BadRequestError) {
    return res.status(error.statusCode).json({
      status: false,
      message: error.message,
    });
  }
  
  return res.status(500).json({ status: false, message: 'Unknown error' });
}
