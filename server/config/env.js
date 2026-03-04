const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

module.exports = {
    validateEnv,
    env: {
        port: parseInt(process.env.PORT, 10) || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        mongoUri: process.env.MONGODB_URI,
        jwt: {
            secret: process.env.JWT_SECRET,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
        },
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
        },
        paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
            max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
        },
    },
};
