"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * Middleware to verify JWT token.
 * Attaches decoded user data to `req.user` if valid.
 */
// εδώ δεν μας επετρεπε να είχαμε απλός req: Request μαλλον γιατι είναι middleware
const verifyToken = async (req, res, next) => {
    const token = auth_service_1.authService.getTokenFrom(req);
    if (!token) {
        return res.status(401).json({ status: false, message: 'No token found' });
    }
    const verificationResult = auth_service_1.authService.verifyAccessToken(token);
    if (!verificationResult.verified) {
        return res.status(401).json({ status: false, error: verificationResult.data
        });
    }
    const result = await auth_service_1.authService.verifyAndFetchUser(token);
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
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.roles.includes(requiredRole)) {
            return res.status(403).json({ status: false, error: 'Forbidden' });
        }
        return next();
    };
};
exports.middleware = {
    verifyToken,
    checkRole
};
//# sourceMappingURL=verification.middleware.js.map