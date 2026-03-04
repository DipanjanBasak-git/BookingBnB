const userService = require('./user.service');
const { sendSuccess, sendCreated, sendError } = require('../../shared/responseFormatter');

const getProfile = async (req, res, next) => {
    try {
        const userId = req.params.id || req.user.id;
        const user = await userService.getUserById(userId);
        sendSuccess(res, user, 'Profile retrieved');
    } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        sendSuccess(res, user, 'Profile updated');
    } catch (error) { next(error); }
};

const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) return sendError(res, 'Image file is required', 400);
        const user = await userService.uploadProfileImage(req.user.id, req.file.buffer);
        sendSuccess(res, user, 'Profile image updated');
    } catch (error) { next(error); }
};

const submitVerification = async (req, res, next) => {
    try {
        if (!req.file) return sendError(res, 'ID proof document is required', 400);
        const user = await userService.submitVerification(req.user.id, req.file.buffer);
        sendSuccess(res, user, 'Verification submitted. Admin will review within 24 hours.');
    } catch (error) { next(error); }
};

const getPendingVerifications = async (req, res, next) => {
    try {
        const hosts = await userService.getPendingVerifications();
        sendSuccess(res, hosts, 'Pending verifications retrieved');
    } catch (error) { next(error); }
};

const reviewVerification = async (req, res, next) => {
    try {
        const { action, rejectionReason } = req.body;
        const host = await userService.reviewVerification(req.user.id, req.params.id, action, rejectionReason);
        sendSuccess(res, host, `Host ${action === 'approve' ? 'verified' : 'rejected'} successfully`);
    } catch (error) { next(error); }
};

const toggleWishlist = async (req, res, next) => {
    try {
        const result = await userService.toggleWishlist(req.user.id, req.params.listingId);
        sendSuccess(res, result, `Listing ${result.action} to wishlist`);
    } catch (error) { next(error); }
};

const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await userService.getWishlist(req.user.id);
        sendSuccess(res, wishlist, 'Wishlist retrieved');
    } catch (error) { next(error); }
};

module.exports = {
    getProfile, updateProfile, uploadProfileImage,
    submitVerification, getPendingVerifications, reviewVerification,
    toggleWishlist, getWishlist,
};
