import request from 'supertest';
import express, { Application } from 'express';
import { Server } from 'http';
import { aiModerationController } from '../moderation.controller';
import * as gptService from '../gpt.service';

describe('AI Moderation API', () => {
  let app: Application;
  let server: Server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/api/moderationAi', aiModerationController.moderationResult);
    server = app.listen(0); // random free port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('POST /api/moderationAi', () => {
    const validKey = 'test-key';
    const originalEnv = process.env.OPENAI_API_KEY;

    beforeEach(() => {
      process.env.OPENAI_API_KEY = validKey;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      process.env.OPENAI_API_KEY = originalEnv;
    });

    it('returns true for a safe comment', async () => {
      const spy = jest
        .spyOn(gptService, 'getGPTResponse')
        .mockResolvedValueOnce('true');

      const res = await request(app)
        .post('/api/moderationAi')
        .send({ commentToCheck: 'This necklace is beautiful' });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: true, data: true });
    });

    it('returns false for a profane comment', async () => {
      const spy = jest
        .spyOn(gptService, 'getGPTResponse')
        .mockResolvedValueOnce('false');

      const res = await request(app)
        .post('/api/moderationAi')
        .send({ commentToCheck: 'This shop is stupid' });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: true, data: false });
    });

    it('returns 404 if API key is missing', async () => {
      jest.resetModules(); // καθαρίζει cache των modules
      process.env = { ...process.env, OPENAI_API_KEY: '' }; // empty string

      const res = await request(app)
        .post('/api/moderationAi')
        .send({ commentToCheck: 'Anything' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: false,
        message: 'ENV not found',
      });
    });

    it('returns 404 if commentToCheck is missing', async () => {
      const res = await request(app)
        .post('/api/moderationAi')
        .send({}); // no comment

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: false,
        message: 'Comment not found',
      });
    });

    it('handles error from getGPTResponse', async () => {
      const spy = jest
        .spyOn(gptService, 'getGPTResponse')
        .mockRejectedValueOnce(new Error('Fake error'));

      const res = await request(app)
        .post('/api/moderationAi')
        .send({ commentToCheck: 'Something' });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(500);
      expect(res.body.status).toBe(false);
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message).toContain('Fake error');
    });
  });
});
