/* eslint-disable no-console */
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';


// Strict limiter: max 5 per 15 min per IP
// η βιβλιοθήκh Ratelimit λειτουργεί σαν Middleware, με προστατεύει απο DDOS και brute force σπασιμο των κωδικών
export const limiter = (
  minutes: number,
  maxTries: number,
  message = 'Too many requests, please try again later.'
) => {
  console.log('limiter loaded with NODE_ENV:', process.env.NODE_ENV);

  if (process.env.NODE_ENV?.toLowerCase() === 'test') {
    // no limiting in tests
    return (_req: Request, _res: Response, next: () => void) => next();
  }

  const limit = rateLimit({
    windowMs: minutes * 60 * 1000, // how long the time window is
    max: maxTries, // how many requests allowed
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        status: false,
        message,
      });
    },
    standardHeaders: true, // add `RateLimit-*` headers
    legacyHeaders: false,  // disable `X-RateLimit-*` headers
  });

  return limit;
};

/* now used in
Auth (auth.routes.ts)

POST /api/auth/ → login (15 min / 5 tries)
POST /api/auth/refresh → refresh token (15 min / 5 tries)
GET /api/auth/google/url/signup → get Google signup URL (15 min / 5 tries)

Email (email.routes.ts)
POST /api/email/:transactionId → send “thank you” email (15 min / 5 tries)

Transactions (transaction.routes.ts)
POST /api/transaction/ → create a new transaction (15 min / 5 tries)
*/
