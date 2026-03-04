const winston = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
    ),
    defaultMeta: { service: 'bookingbnb-api' },
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                simple()
            ),
        }),
    ],
});

// In development, also log to files
if (process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
    }));
    logger.add(new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
    }));
}

module.exports = logger;
