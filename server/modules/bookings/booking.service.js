const mongoose = require('mongoose');
const Booking = require('./booking.model');
const Listing = require('../listings/listing.model');
const paymentService = require('../payments/payment.service');
const { AppError } = require('../../middleware/error.middleware');
const { datesOverlap, isValidDateRange, calculateNights, calculateTotalPrice } = require('../../shared/utils');
const { getPaginationOptions } = require('../../shared/utils');
const logger = require('../../shared/logger');

/**
 * Check availability for a listing on given dates
 */
const checkAvailability = async (listingId, checkIn, checkOut, excludeBookingId = null) => {
    const query = {
        listing: listingId,
        status: { $in: ['pending', 'confirmed'] },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
    };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const overlapping = await Booking.findOne(query);
    return !overlapping; // true = available
};

/**
 * Create a booking with MongoDB session transaction
 * Flow: Validate → Create Payment Intent → Await Confirmation → Commit
 */
const createBooking = async (guestId, bookingData) => {
    const { listingId, checkIn, checkOut, guests, specialRequests } = bookingData;

    // ─── Pre-transaction Validation ──────────────────────────────────────────
    if (!isValidDateRange(checkIn, checkOut)) {
        throw new AppError('Check-out date must be after check-in date', 400);
    }

    const listing = await Listing.findById(listingId).populate('host', '_id name');
    if (!listing) throw new AppError('Listing not found', 404);
    if (!listing.isPublished) throw new AppError('This listing is not available', 400);

    const totalGuests = (guests?.adults || 1) + (guests?.children || 0);
    if (totalGuests > listing.capacity.guests) {
        throw new AppError(
            `This listing accommodates maximum ${listing.capacity.guests} guests`,
            400
        );
    }

    // Validate minimum/maximum nights
    const nights = calculateNights(checkIn, checkOut);
    if (nights < listing.availabilityConfig.minNights) {
        throw new AppError(`Minimum stay is ${listing.availabilityConfig.minNights} night(s)`, 400);
    }
    if (nights > listing.availabilityConfig.maxNights) {
        throw new AppError(`Maximum stay is ${listing.availabilityConfig.maxNights} night(s)`, 400);
    }

    // ─── Date Overlap Check (server-side only) ────────────────────────────────
    const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
    if (!isAvailable) {
        throw new AppError('These dates are not available for this listing', 409);
    }

    // ─── Price Calculation ────────────────────────────────────────────────────
    const subtotal = calculateTotalPrice(listing.pricing.basePrice, checkIn, checkOut);
    const cleaningFee = listing.pricing.cleaningFee || 0;
    const serviceFee = listing.pricing.serviceFee || 0;
    const totalPrice = parseFloat((subtotal + cleaningFee + serviceFee).toFixed(2));

    // ─── Create Payment Intent ────────────────────────────────────────────────
    // Do NOT create booking yet — wait for payment confirmation
    const paymentIntent = await paymentService.createPaymentIntent({
        amount: totalPrice,
        currency: listing.pricing.currency || 'INR',
        bookingId: `PENDING_${Date.now()}`,
        guestId,
    });

    logger.info(`Payment intent created for listing ${listingId}: ${paymentIntent.orderId}`);

    // Return payment intent details to client
    // Client will confirm payment and call /bookings/confirm
    return {
        paymentIntent,
        bookingSummary: {
            listingId,
            checkIn,
            checkOut,
            guests,
            nights,
            pricing: {
                basePrice: listing.pricing.basePrice,
                nights,
                subtotal,
                cleaningFee,
                serviceFee,
                totalPrice,
                currency: listing.pricing.currency,
            },
            totalGuests,
        },
    };
};

/**
 * Confirm booking after successful payment (no replica-set transaction required)
 */
const confirmBooking = async (guestId, confirmData) => {
    const { listingId, checkIn, checkOut, guests, specialRequests, paymentDetails } = confirmData;

    const listing = await Listing.findById(listingId).populate('host', '_id');
    if (!listing) throw new AppError('Listing not found', 404);

    // ─── Verify Payment ────────────────────────────────────────────────────────
    const paymentVerification = await paymentService.verifyPayment({
        orderId: paymentDetails.orderId,
        paymentId: paymentDetails.paymentId,
        signature: paymentDetails.signature,
    });

    if (!paymentVerification.verified) {
        throw new AppError('Payment verification failed', 400);
    }

    // ─── Race-condition guard: re-check availability ────────────────────────
    const isStillAvailable = await checkAvailability(listingId, checkIn, checkOut);
    if (!isStillAvailable) {
        throw new AppError('Sorry, these dates were just booked by someone else. Please choose different dates.', 409);
    }

    // ─── Compute pricing ────────────────────────────────────────────────────
    const totalGuests = (guests?.adults || 1) + (guests?.children || 0);
    const nights = calculateNights(checkIn, checkOut);
    const subtotal = calculateTotalPrice(listing.pricing.basePrice, checkIn, checkOut);
    const cleaningFee = listing.pricing.cleaningFee || 0;
    const serviceFee = listing.pricing.serviceFee || 0;
    const totalPrice = parseFloat((subtotal + cleaningFee + serviceFee).toFixed(2));

    // ─── Create booking ─────────────────────────────────────────────────────
    const booking = await Booking.create({
        listing: listingId,
        guest: guestId,
        host: listing.host._id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests || { adults: 1, children: 0, infants: 0 },
        totalGuests,
        pricing: {
            basePrice: listing.pricing.basePrice,
            nights,
            subtotal,
            cleaningFee,
            serviceFee,
            totalPrice,
            currency: listing.pricing.currency || 'INR',
        },
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentIntentId: paymentVerification.paymentId,
        paymentOrderId: paymentVerification.orderId,
        paymentProvider: confirmData.paymentProvider || 'mock',
        paidAt: new Date(),
        specialRequests,
    });

    // ─── Update listing stats ────────────────────────────────────────────────
    await Listing.findByIdAndUpdate(
        listingId,
        { $inc: { totalBookings: 1, totalRevenue: totalPrice } }
    );

    logger.info(`Booking confirmed: ${booking.confirmationCode} for listing ${listingId}`);

    return await booking.populate([
        { path: 'listing', select: 'title images location pricing' },
        { path: 'guest', select: 'name email' },
    ]);
};


/**
 * Cancel a booking
 */
const cancelBooking = async (bookingId, userId, reason) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const isGuest = booking.guest.toString() === userId;
    const isHost = booking.host.toString() === userId;

    if (!isGuest && !isHost) throw new AppError('Not authorized to cancel this booking', 403);
    if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new AppError('Cannot cancel a booking that is already completed or cancelled', 400);
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    booking.cancellationReason = reason;
    booking.paymentStatus = 'refunded';

    await booking.save();
    return booking;
};

/**
 * Get bookings for a guest
 */
const getGuestBookings = async (guestId, query) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = { guest: guestId };
    if (query.status) filter.status = query.status;

    const now = new Date();
    if (query.upcoming === 'true') {
        filter.checkIn = { $gt: now };
        filter.status = 'confirmed';
    } else if (query.past === 'true') {
        filter.checkOut = { $lt: now };
    }

    const [bookings, total] = await Promise.all([
        Booking.find(filter)
            .populate('listing', 'title images location pricing type')
            .populate('host', 'name profileImage')
            .sort({ checkIn: -1 })
            .skip(skip).limit(limit),
        Booking.countDocuments(filter),
    ]);

    return { bookings, total, page, limit };
};

/**
 * Get bookings for a host
 */
const getHostBookings = async (hostId, query) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = { host: hostId };
    if (query.status) filter.status = query.status;
    if (query.listingId) filter.listing = query.listingId;

    const [bookings, total] = await Promise.all([
        Booking.find(filter)
            .populate('listing', 'title images location type')
            .populate('guest', 'name email profileImage phone')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit),
        Booking.countDocuments(filter),
    ]);

    return { bookings, total, page, limit };
};

/**
 * Get a single booking by ID
 */
const getBookingById = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId)
        .populate('listing', 'title images location pricing host')
        .populate('guest', 'name email phone profileImage')
        .populate('host', 'name email phone profileImage');

    if (!booking) throw new AppError('Booking not found', 404);

    const isGuest = booking.guest._id.toString() === userId;
    const isHost = booking.host._id.toString() === userId;
    if (!isGuest && !isHost) throw new AppError('Not authorized to view this booking', 403);

    return booking;
};

module.exports = {
    checkAvailability,
    createBooking,
    confirmBooking,
    cancelBooking,
    getGuestBookings,
    getHostBookings,
    getBookingById,
};
