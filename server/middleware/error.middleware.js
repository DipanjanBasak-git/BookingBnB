const logger = require('../shared/logger');
const { sendError } = require('../shared/responseFormatter');

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
const errorMiddleware = (err, req, res, next) => {
    // Log the error
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        return sendError(res, 'Validation failed', 400, errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return sendError(res, `${field} already exists`, 409);
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return sendError(res, `Invalid ${err.path}`, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired', 401);
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File too large. Maximum size is 5MB.', 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return sendError(res, 'Unexpected file field.', 400);
    }

    // Custom app errors
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    return sendError(res, message, statusCode);
};

/**
 * 404 handler – for unmatched routes
 */
const notFoundMiddleware = (req, res) => {
    return sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
};

/**
 * Custom error class for app-level errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorMiddleware, notFoundMiddleware, AppError };
