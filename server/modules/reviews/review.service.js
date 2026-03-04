const Review = require('./review.model');
const Booking = require('../bookings/booking.model');
const { AppError } = require('../../middleware/error.middleware');
const { getPaginationOptions } = require('../../shared/utils');

/**
 * Create a review – guest must have a completed/past booking
 */
const createReview = async (guestId, reviewData) => {
    const { listingId, bookingId, rating, comment } = reviewData;

    // Verify the booking exists and belongs to this guest
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest.toString() !== guestId) {
        throw new AppError('You can only review your own bookings', 403);
    }
    if (booking.listing.toString() !== listingId) {
        throw new AppError('Listing mismatch', 400);
    }

    // Check booking is completed or past checkout
    const isPastCheckout = new Date() > new Date(booking.checkOut);
    const isConfirmed = booking.status === 'confirmed';
    const isCompleted = booking.status === 'completed';

    if (!isCompleted && !(isConfirmed && isPastCheckout)) {
        throw new AppError('You can only review after your stay is completed', 400);
    }

    if (booking.isReviewed) {
        throw new AppError('You have already reviewed this booking', 400);
    }

    // Check no duplicate review for this listing from this guest
    const existingReview = await Review.findOne({ listing: listingId, guest: guestId });
    if (existingReview) {
        throw new AppError('You have already reviewed this listing', 409);
    }

    const review = await Review.create({
        listing: listingId,
        booking: bookingId,
        guest: guestId,
        rating: { overall: rating.overall, ...rating },
        comment,
    });

    // Mark booking as reviewed
    await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

    return await review.populate('guest', 'name profileImage createdAt');
};

/**
 * Edit a review (once only)
 */
const editReview = async (reviewId, guestId, updateData) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.guest.toString() !== guestId) throw new AppError('Not authorized', 403);
    if (review.editedOnce) throw new AppError('Reviews can only be edited once', 400);

    review.rating = { ...review.rating, ...updateData.rating };
    review.comment = updateData.comment || review.comment;
    review.editedOnce = true;
    review.editedAt = new Date();

    await review.save();
    return review;
};

/**
 * Host reply to a review
 */
const replyToReview = async (reviewId, hostId, replyText) => {
    const review = await Review.findById(reviewId).populate('listing', 'host');
    if (!review) throw new AppError('Review not found', 404);
    if (review.listing.host.toString() !== hostId) {
        throw new AppError('Only the listing host can reply to reviews', 403);
    }
    if (review.hostReply?.text) {
        throw new AppError('You have already replied to this review', 400);
    }

    review.hostReply = { text: replyText, repliedAt: new Date() };
    await review.save();
    return review;
};

/**
 * Get reviews for a listing
 */
const getListingReviews = async (listingId, query) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = { listing: listingId };

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate('guest', 'name profileImage createdAt')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit),
        Review.countDocuments(filter),
    ]);

    return { reviews, total, page, limit };
};

/**
 * Get reviews written by a guest
 */
const getGuestReviews = async (guestId) => {
    return Review.find({ guest: guestId })
        .populate('listing', 'title images location type')
        .sort({ createdAt: -1 });
};

module.exports = {
    createReview, editReview, replyToReview,
    getListingReviews, getGuestReviews,
};
