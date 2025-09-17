/* eslint-disable no-console */
 
import { Response } from 'express';
import { handleControllerError } from '../services/errorHnadler';
import { ZodError, ZodIssue } from 'zod';

describe('handleControllerError', () => {
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock } as Partial<Response>;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('handles ZodError', () => {
    const zodError = new ZodError([{ path: ['username'], message: 'Required' } as ZodIssue]);
    handleControllerError(res as Response, zodError);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      message: 'Validation failed',
      details: zodError.issues,
    });
  });

  it('handles Error with status', () => {
    const error = new Error('Not found') as Error & { status?: number };
    error.status = 404;
    handleControllerError(res as Response, error);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Not found' });
  });

  it('handles Error without status', () => {
    const error = new Error('Server failed');
    handleControllerError(res as Response, error);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Server failed' });
  });

  it('handles unknown error', () => {
    handleControllerError(res as Response, 'oops');
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Unknown error' });
  });
});
