const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Profile
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), userController.uploadProfileImage);

// Host verification
router.post('/verify', authMiddleware, requireRole('host'), upload.single('idProof'), userController.submitVerification);

// Admin: verification management
router.get('/verifications/pending', authMiddleware, requireRole('admin'), userController.getPendingVerifications);
router.post('/verifications/:id', authMiddleware, requireRole('admin'), userController.reviewVerification);

// Wishlist
router.get('/wishlist', authMiddleware, userController.getWishlist);
router.post('/wishlist/:listingId', authMiddleware, userController.toggleWishlist);

// Public profile
router.get('/:id', userController.getProfile);

module.exports = router;
