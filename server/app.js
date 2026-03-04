const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const { env } = require('./config/env');
const logger = require('./shared/logger');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const listingRoutes = require('./modules/listings/listing.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin: [env.clientUrl, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Webhook raw body (must be before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Sanitization ────────────────────────────────────────────────────────────
app.use(mongoSanitize());

// ─── Request Logging ─────────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
    }));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BookingBnB API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Static Files (if serving frontend later) ─────────────────────────────────
// app.use(express.static(path.join(__dirname, '../client/out')));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
