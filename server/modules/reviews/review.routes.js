const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// Public
router.get('/listing/:listingId', reviewController.getListingReviews);

// Protected
router.post('/', authMiddleware, requireRole('guest'), reviewController.createReview);
router.get('/my', authMiddleware, reviewController.getMyReviews);
router.put('/:id', authMiddleware, requireRole('guest'), reviewController.editReview);
router.post('/:id/reply', authMiddleware, requireRole('host'), reviewController.replyToReview);

module.exports = router;
