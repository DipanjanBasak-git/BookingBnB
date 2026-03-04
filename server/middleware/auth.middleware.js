const jwt = require('jsonwebtoken');
const { sendError } = require('../shared/responseFormatter');
const { env } = require('../config/env');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, env.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Token expired. Please log in again.', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            return sendError(res, 'Invalid token.', 401);
        }
        return sendError(res, 'Authentication failed.', 401);
    }
};

/**
 * Optional auth – attach user if token present, but don't block
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, env.jwt.secret);
            req.user = decoded;
        }
    } catch {
        // Silently ignore invalid tokens for optional auth
    }
    next();
};

module.exports = { authMiddleware, optionalAuth };
