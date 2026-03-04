const paymentService = require('./payment.service');
const { sendSuccess, sendError } = require('../../shared/responseFormatter');
const logger = require('../../shared/logger');

const createPaymentIntent = async (req, res, next) => {
    try {
        const { amount, currency, bookingId } = req.body;
        if (!amount) return sendError(res, 'Amount is required', 400);
        const result = await paymentService.createPaymentIntent({
            amount: parseFloat(amount),
            currency: currency || 'INR',
            bookingId: bookingId || 'unknown',
            guestId: req.user.id,
        });
        sendSuccess(res, result, 'Payment intent created');
    } catch (error) { next(error); }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, signature } = req.body;
        const result = await paymentService.verifyPayment({ orderId, paymentId, signature });
        sendSuccess(res, result, 'Payment verified');
    } catch (error) { next(error); }
};

const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'] || req.headers['x-mock-signature'];
        const result = await paymentService.handleWebhook(req.body, signature);
        logger.info(`Webhook processed: ${result.event}`);
        res.json({ received: true });
    } catch (error) { next(error); }
};

module.exports = { createPaymentIntent, verifyPayment, handleWebhook };
