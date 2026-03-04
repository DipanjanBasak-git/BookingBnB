/**
 * Payment Abstraction Layer
 * Supports: Razorpay (test), Mock (fallback)
 * Easily extensible to Stripe or any other provider
 */
const { env } = require('../../config/env');
const { AppError } = require('../../middleware/error.middleware');
const { generateTransactionId } = require('../../shared/utils');
const logger = require('../../shared/logger');
const crypto = require('crypto');

// ─── Provider Abstraction ─────────────────────────────────────────────────────

/**
 * Mock Payment Provider – simulates payment flow for demo/dev
 */
const mockProvider = {
    createPaymentIntent: async ({ amount, currency, bookingId, guestId }) => {
        const orderId = `MOCK_ORDER_${Date.now()}`;
        logger.info(`[MOCK PAYMENT] Order created: ${orderId} | Amount: ${amount} ${currency}`);
        return {
            orderId,
            amount,
            currency,
            provider: 'mock',
            keyId: 'mock_key',
            metadata: { bookingId, guestId },
        };
    },

    verifyPayment: async ({ orderId, paymentId, signature }) => {
        // Mock: always succeed unless explicitly told to fail
        logger.info(`[MOCK PAYMENT] Verifying: orderId=${orderId} paymentId=${paymentId}`);
        return {
            verified: true,
            paymentId: paymentId || `MOCK_PAY_${Date.now()}`,
            orderId,
        };
    },

    handleWebhook: async (rawBody, signature) => {
        logger.info('[MOCK PAYMENT] Webhook received');
        return { event: 'payment.captured', verified: true };
    },
};

/**
 * Razorpay Provider
 */
const razorpayProvider = {
    _getInstance: () => {
        const Razorpay = require('razorpay');
        return new Razorpay({
            key_id: env.razorpay.keyId,
            key_secret: env.razorpay.keySecret,
        });
    },

    createPaymentIntent: async ({ amount, currency = 'INR', bookingId, guestId, notes = {} }) => {
        const razorpay = razorpayProvider._getInstance();
        const options = {
            amount: Math.round(amount * 100), // Razorpay takes paise
            currency,
            receipt: `BNB_${bookingId}`,
            notes: { bookingId: bookingId.toString(), guestId: guestId.toString(), ...notes },
        };
        const order = await razorpay.orders.create(options);
        return {
            orderId: order.id,
            amount: order.amount / 100,
            currency: order.currency,
            provider: 'razorpay',
            keyId: env.razorpay.keyId,
        };
    },

    verifyPayment: async ({ orderId, paymentId, signature }) => {
        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', env.razorpay.keySecret)
            .update(body)
            .digest('hex');

        const verified = expectedSignature === signature;

        if (!verified) {
            throw new AppError('Payment signature verification failed', 400);
        }

        return { verified: true, paymentId, orderId };
    },

    handleWebhook: async (rawBody, signature) => {
        const expectedSignature = crypto
            .createHmac('sha256', env.razorpay.webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new AppError('Invalid webhook signature', 400);
        }

        const event = JSON.parse(rawBody);
        return { event: event.event, verified: true, data: event.payload };
    },
};

// ─── Payment Service (Provider Selector) ─────────────────────────────────────

const getProvider = () => {
    const providerName = env.paymentProvider;
    switch (providerName) {
        case 'razorpay': return razorpayProvider;
        case 'mock': return mockProvider;
        default:
            logger.warn(`Unknown payment provider: ${providerName}. Using mock.`);
            return mockProvider;
    }
};

/**
 * Create a payment intent for a booking
 */
const createPaymentIntent = async ({ amount, currency = 'INR', bookingId, guestId }) => {
    const provider = getProvider();
    try {
        return await provider.createPaymentIntent({ amount, currency, bookingId, guestId });
    } catch (error) {
        logger.error('Payment intent creation failed:', error);
        throw new AppError(`Payment initialization failed: ${error.message}`, 500);
    }
};

/**
 * Verify a completed payment
 */
const verifyPayment = async ({ orderId, paymentId, signature }) => {
    const provider = getProvider();
    try {
        return await provider.verifyPayment({ orderId, paymentId, signature });
    } catch (error) {
        logger.error('Payment verification failed:', error);
        throw error;
    }
};

/**
 * Handle incoming webhook from payment provider
 */
const handleWebhook = async (rawBody, signature) => {
    const provider = getProvider();
    return await provider.handleWebhook(rawBody, signature);
};

module.exports = {
    createPaymentIntent,
    verifyPayment,
    handleWebhook,
};
