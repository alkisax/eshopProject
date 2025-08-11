// middleware/verification.middleware.js
import type { Response, NextFunction  } from 'express';
import { authService } from '../services/auth.service';
import type { Roles, AuthRequest  } from "../types/user.types";

/**
 * Middleware to verify JWT token.
 * Attaches decoded user data to `req.user` if valid.
 */
// εδώ δεν μας επετρεπε να είχαμε απλός req: Request μαλλον γιατι είναι middleware

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = authService.getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token found'})
  }
  const verificationResult = authService.verifyAccessToken(token);

  if (!verificationResult.verified) {
    return res.status(401).json({ status: false, error: verificationResult.data
    });
  }
  
  const result = await authService.verifyAndFetchUser(token);
  if (!result.verified) {
    return res.status(401).json({ status: false, message: result.reason });
  }
  if (!result.user) {
    return res.status(401).json({ status: false, message: 'User not found' });
  }

  req.user = result.user;
  return next();
};

/**
 * Middleware to check if user has required role.
 * Call after verifyToken middleware.
 */

const checkRole = (requiredRole: Roles) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles.includes(requiredRole)) {
      return res.status(403).json({ status: false, error: 'Forbidden' });
    }

    return next();
  };
};

export const middleware = {

  verifyToken,
  checkRole
}
