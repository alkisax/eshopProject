// middleware/verification.middleware.js

const authService = require('../services/auth.service');
const logger = require('../logger/logger');

/**
 * Middleware to verify JWT token.
 * Attaches decoded user data to `req.user` if valid.
 */
const verifyToken = (req, res, next) => {
  const token = authService.getTokenFrom(req);
  const verificationResult = authService.verifyAccessToken(token);

  if (!verificationResult.verified) {
    logger.warn(`Unauthorized access attempt with token: ${token}`);
    return res.status(401).json({
      status: false,
      error: verificationResult.data
    });
  }

  req.user = verificationResult.data;
  next();
};

/**
 * Middleware to check if user has required role.
 * Call after verifyToken middleware.
 */
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.roles.includes(requiredRole)) {
      logger.warn(`Forbidden access by user: ${user?.username || 'unknown'}`);
      return res.status(403).json({
        status: false,
        error: 'Forbidden'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};
