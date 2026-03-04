const express = require('express');
const router = express.Router();
const listingController = require('./listing.controller');
const { authMiddleware, optionalAuth } = require('../../middleware/auth.middleware');
const { requireVerifiedHost, requireRole } = require('../../middleware/role.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Public routes
router.get('/', optionalAuth, listingController.getListings);
router.get('/featured', listingController.getFeaturedListings);
router.get('/slug/:slug', listingController.getListingBySlug);
router.get('/:id', listingController.getListingById);

// Protected: Host only (verified)
router.post('/', authMiddleware, requireVerifiedHost, upload.array('images', 10), listingController.createListing);
router.get('/host/my-listings', authMiddleware, requireRole('host', 'admin'), listingController.getHostListings);
router.put('/:id', authMiddleware, requireRole('host', 'admin'), upload.array('images', 10), listingController.updateListing);
router.patch('/:id/publish', authMiddleware, requireVerifiedHost, listingController.togglePublish);
router.delete('/:id', authMiddleware, requireRole('host', 'admin'), listingController.deleteListing);

module.exports = router;
