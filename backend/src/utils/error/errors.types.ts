// backend\src\utils\error\errors.types.ts
export interface AppError extends Error {
  statusCode: number;
}

export class NotFoundError extends Error implements AppError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ValidationError extends Error implements AppError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class DatabaseError extends Error implements AppError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

export class BadRequestError extends Error implements AppError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

// not still used
export class EmbeddingError extends Error {
  status = 502; // Bad gateway
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddingError';
  }
}
