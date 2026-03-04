const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

router.post('/create-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook); // Raw body, no auth

module.exports = router;
