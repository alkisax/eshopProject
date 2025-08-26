import dotenv from 'dotenv';
dotenv.config();

process.env.APPWRITE_PROJECT_ID = 'fake';
process.env.APPWRITE_ENDPOINT = 'http://fake';
process.env.APPWRITE_API_KEY = 'fake-key';

import request from 'supertest';
import app from '../../app';

describe('App routes', () => {
  it('should respond to /api/ping', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('pong');
  });

  it('should respond to /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });
});
