import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Upload from '../upload.model';
import uploadDao from '../upload.dao';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Upload.deleteMany({});
});

afterAll(async () => {
  await Upload.deleteMany({});
  await disconnect();
});

describe('GET /api/upload-multer', () => {
  it('should return empty array when no uploads', async () => {
    const res = await request(app).get('/api/upload-multer');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('should return uploads when documents exist', async () => {
    const saved = await Upload.create({
      name: 'Test file',
      desc: 'desc',
      file: {
        data: Buffer.from('dummy'),
        contentType: 'image/png',
        originalName: 'dummy.png',
        filename: 'dummy.png',
      },
    });

    const res = await request(app).get('/api/upload-multer');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]._id).toBe(saved._id.toString());
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest.spyOn(uploadDao, 'getAllUploads').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app).get('/api/upload-multer');
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});

import { handleControllerError } from '../../utils/errorHandler';
import type { Response } from 'express';

describe('handleControllerError utility', () => {
  it('should return 500 with Unknown error if error is not instance of Error', () => {
    // mock Response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // act
    handleControllerError(res, 'not-an-error');

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Unknown error',
    });
  });

  it('should return 500 with Unknown error if error is not instance of Error', () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    handleControllerError(res as Response, 'not-an-error');

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      error: 'Unknown error',
    });
  });
});

