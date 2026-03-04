const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../users/user.model');
const { env } = require('../../config/env');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        env.jwt.refreshSecret,
        { expiresIn: env.jwt.refreshExpiresIn }
    );
};

/**
 * Register a new user
 */
const register = async ({ name, email, password, role }) => {
    // Only guest and host roles allowed for self-registration
    if (role === 'admin') {
        throw new AppError('Cannot register as admin', 403);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'guest',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
    };
};

/**
 * Login a user
 */
const login = async ({ email, password }) => {
    // Explicitly select password (normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError('Refresh token required', 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch {
        throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
        throw new AppError('User not found or deactivated', 401);
    }

    const newAccessToken = generateAccessToken(user);
    return { accessToken: newAccessToken };
};

/**
 * Get the current authenticated user
 */
const getMe = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user.toPublicJSON();
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    getMe,
    generateAccessToken,
    generateRefreshToken,
};
