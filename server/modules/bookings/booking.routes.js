const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// Check availability (public)
router.get('/availability', bookingController.checkAvailability);

// Protected routes
router.post('/', authMiddleware, requireRole('guest', 'admin'), bookingController.createBooking);
router.post('/confirm', authMiddleware, requireRole('guest', 'admin'), bookingController.confirmBooking);
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);
router.get('/host', authMiddleware, requireRole('host', 'admin'), bookingController.getHostBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
