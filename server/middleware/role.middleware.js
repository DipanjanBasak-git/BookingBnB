const { sendError } = require('../shared/responseFormatter');

/**
 * Role-based access control middleware factory
 * Usage: requireRole('admin') or requireRole('host', 'admin')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'Authentication required.', 401);
        }

        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                `Access denied. Required role: ${roles.join(' or ')}.`,
                403
            );
        }

        next();
    };
};

/**
 * Verified host middleware – host must be verified to perform certain actions
 * NOTE: Verification check temporarily disabled – will be re-enabled in a future release.
 */
const requireVerifiedHost = (req, res, next) => {
    if (!req.user) {
        return sendError(res, 'Authentication required.', 401);
    }

    if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return sendError(res, 'Only hosts can perform this action.', 403);
    }

    // Verification check intentionally skipped for now
    next();
};

module.exports = { requireRole, requireVerifiedHost };
