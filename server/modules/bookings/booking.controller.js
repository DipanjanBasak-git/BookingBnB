const bookingService = require('./booking.service');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../../shared/responseFormatter');

const createBooking = async (req, res, next) => {
    try {
        const result = await bookingService.createBooking(req.user.id, req.body);
        sendCreated(res, result, 'Booking initiated. Complete payment to confirm.');
    } catch (error) { next(error); }
};

const confirmBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.confirmBooking(req.user.id, req.body);
        sendCreated(res, booking, 'Booking confirmed successfully!');
    } catch (error) { next(error); }
};

const cancelBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.body.reason);
        sendSuccess(res, booking, 'Booking cancelled successfully');
    } catch (error) { next(error); }
};

const getMyBookings = async (req, res, next) => {
    try {
        const { bookings, total, page, limit } = await bookingService.getGuestBookings(req.user.id, req.query);
        sendPaginated(res, bookings, { total, page, limit }, 'Bookings retrieved');
    } catch (error) { next(error); }
};

const getHostBookings = async (req, res, next) => {
    try {
        const { bookings, total, page, limit } = await bookingService.getHostBookings(req.user.id, req.query);
        sendPaginated(res, bookings, { total, page, limit }, 'Host bookings retrieved');
    } catch (error) { next(error); }
};

const getBookingById = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id, req.user.id);
        sendSuccess(res, booking, 'Booking retrieved');
    } catch (error) { next(error); }
};

const checkAvailability = async (req, res, next) => {
    try {
        const { listingId, checkIn, checkOut } = req.query;
        if (!listingId || !checkIn || !checkOut) {
            return sendError(res, 'listingId, checkIn, and checkOut are required', 400);
        }
        const available = await bookingService.checkAvailability(listingId, checkIn, checkOut);
        sendSuccess(res, { available }, available ? 'Dates are available' : 'Dates are not available');
    } catch (error) { next(error); }
};

module.exports = {
    createBooking, confirmBooking, cancelBooking,
    getMyBookings, getHostBookings, getBookingById, checkAvailability,
};
