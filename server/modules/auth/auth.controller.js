const { body, validationResult } = require('express-validator');
const authService = require('./auth.service');
const { sendSuccess, sendCreated, sendError } = require('../../shared/responseFormatter');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    body('role')
        .optional()
        .isIn(['guest', 'host']).withMessage('Role must be guest or host'),
];

const loginValidation = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ─── Helper: check validation errors ─────────────────────────────────────────
const checkValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        sendError(res, 'Validation failed', 400, errors.array().map(e => ({ field: e.path, message: e.msg })));
        return false;
    }
    return true;
};

// ─── Controllers ──────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        if (!checkValidation(req, res)) return;
        const result = await authService.register(req.body);
        return sendCreated(res, result, 'Account created successfully');
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        if (!checkValidation(req, res)) return;
        const result = await authService.login(req.body);
        return sendSuccess(res, result, 'Login successful');
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);
        return sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user.id);
        return sendSuccess(res, user, 'User retrieved');
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    // JWT logout is client-side (clear token); server-side is stateless
    // In production, you'd add the token to a blacklist
    return sendSuccess(res, null, 'Logged out successfully');
};

module.exports = {
    register,
    login,
    refreshToken,
    getMe,
    logout,
    registerValidation,
    loginValidation,
};
