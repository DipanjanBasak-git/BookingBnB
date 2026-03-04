require('dotenv').config();
const { validateEnv, env } = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./shared/logger');

// Validate environment variables before starting
validateEnv();

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        const server = app.listen(env.port, () => {
            logger.info(`🚀 BookingBnB API running on port ${env.port} [${env.nodeEnv}]`);
            logger.info(`📍 Health check: http://localhost:${env.port}/health`);
            logger.info(`💳 Payment provider: ${env.paymentProvider}`);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);
            server.close(async () => {
                const mongoose = require('mongoose');
                await mongoose.connection.close();
                logger.info('MongoDB connection closed');
                process.exit(0);
            });

            // Force exit after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', { reason, promise });
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
