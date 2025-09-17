import request from 'supertest';
import express, { Request, Response } from 'express';
import { limiter } from '../limiter';

describe('limiter utility', () => {
  const oldEnv = process.env.NODE_ENV;

  let app: express.Express;

  beforeEach(() => {
    // Force NODE_ENV to something other than "test"
    process.env.NODE_ENV = 'development';

    app = express();
    // Apply limiter: 1 request per 100ms
    app.post('/test', limiter(0.1, 1, 'Too many!'), (_req: Request, res: Response) => {
      res.json({ ok: true });
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv; // restore test env
  });

  it('should allow the first request', async () => {
    const res = await request(app).post('/test');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('should block subsequent requests beyond the limit', async () => {
    await request(app).post('/test'); // first
    const res = await request(app).post('/test'); // second (over limit)

    expect(res.status).toBe(429);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('Too many!');
  });
});
