const reviewService = require('./review.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../../shared/responseFormatter');

const createReview = async (req, res, next) => {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        sendCreated(res, review, 'Review submitted successfully');
    } catch (error) { next(error); }
};

const editReview = async (req, res, next) => {
    try {
        const review = await reviewService.editReview(req.params.id, req.user.id, req.body);
        sendSuccess(res, review, 'Review updated');
    } catch (error) { next(error); }
};

const replyToReview = async (req, res, next) => {
    try {
        const review = await reviewService.replyToReview(req.params.id, req.user.id, req.body.reply);
        sendSuccess(res, review, 'Reply added');
    } catch (error) { next(error); }
};

const getListingReviews = async (req, res, next) => {
    try {
        const { reviews, total, page, limit } = await reviewService.getListingReviews(req.params.listingId, req.query);
        sendPaginated(res, reviews, { total, page, limit }, 'Reviews retrieved');
    } catch (error) { next(error); }
};

const getMyReviews = async (req, res, next) => {
    try {
        const reviews = await reviewService.getGuestReviews(req.user.id);
        sendSuccess(res, reviews, 'Your reviews retrieved');
    } catch (error) { next(error); }
};

module.exports = { createReview, editReview, replyToReview, getListingReviews, getMyReviews };
