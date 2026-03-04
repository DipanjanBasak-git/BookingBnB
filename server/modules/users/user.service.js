const User = require('./user.model');
const { AppError } = require('../../middleware/error.middleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middleware/upload.middleware');

/**
 * Get user profile by ID
 */
const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new AppError('User not found', 404);
    return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
    const allowedFields = ['name', 'phone', 'bio', 'address'];
    const filteredData = {};
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) filteredData[field] = updateData[field];
    });

    const user = await User.findByIdAndUpdate(userId, filteredData, {
        new: true,
        runValidators: true,
        select: '-password',
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
};

/**
 * Upload profile image
 */
const uploadProfileImage = async (userId, fileBuffer) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Delete old image if exists
    if (user.profileImage?.publicId) {
        await deleteFromCloudinary(user.profileImage.publicId);
    }

    const result = await uploadToCloudinary(fileBuffer, 'bookingbnb/profiles');

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: { url: result.secure_url, publicId: result.public_id } },
        { new: true, select: '-password' }
    );
    return updatedUser;
};

/**
 * Submit host verification (ID proof upload)
 */
const submitVerification = async (userId, fileBuffer) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.role !== 'host') throw new AppError('Only hosts can submit verification', 403);
    if (user.isVerified) throw new AppError('Host is already verified', 400);
    if (user.verificationStatus === 'pending') {
        throw new AppError('Verification already submitted and pending review', 400);
    }

    const result = await uploadToCloudinary(fileBuffer, 'bookingbnb/id-proofs');

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            idProof: {
                url: result.secure_url,
                publicId: result.public_id,
                submittedAt: new Date(),
            },
            verificationStatus: 'pending',
        },
        { new: true, select: '-password' }
    );
    return updatedUser;
};

/**
 * Admin: Get all hosts pending verification
 */
const getPendingVerifications = async () => {
    return User.find({
        role: 'host',
        verificationStatus: 'pending'
    }).select('-password').sort({ 'idProof.submittedAt': 1 });
};

/**
 * Admin: Approve or reject host verification
 */
const reviewVerification = async (adminId, hostId, action, rejectionReason) => {
    if (!['approve', 'reject'].includes(action)) {
        throw new AppError('Action must be approve or reject', 400);
    }

    const host = await User.findById(hostId);
    if (!host) throw new AppError('Host not found', 404);
    if (host.role !== 'host') throw new AppError('User is not a host', 400);
    if (host.verificationStatus !== 'pending') {
        throw new AppError('No pending verification for this host', 400);
    }

    const updateData = {
        verificationStatus: action === 'approve' ? 'approved' : 'rejected',
        verifiedAt: action === 'approve' ? new Date() : undefined,
        verifiedBy: action === 'approve' ? adminId : undefined,
        isVerified: action === 'approve',
    };

    if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }

    const updatedHost = await User.findByIdAndUpdate(hostId, updateData, {
        new: true,
        select: '-password',
    });
    return updatedHost;
};

/**
 * Toggle wishlist item
 */
const toggleWishlist = async (userId, listingId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Must compare as strings — wishlist stores ObjectId, listingId is a string
    const index = user.wishlist.findIndex(id => id.toString() === listingId.toString());
    let action;
    if (index > -1) {
        user.wishlist.splice(index, 1);
        action = 'removed';
    } else {
        user.wishlist.push(listingId);
        action = 'added';
    }
    await user.save({ validateBeforeSave: false });
    // Return wishlist as flat string IDs so frontend can sync the store
    return { wishlistIds: user.wishlist.map(id => id.toString()), action };
};

/**
 * Get user wishlist
 */
const getWishlist = async (userId) => {
    const user = await User.findById(userId)
        .populate({
            path: 'wishlist',
            select: 'title images pricing location averageRating type category isPublished',
            match: { isPublished: true },
        });
    if (!user) throw new AppError('User not found', 404);
    return user.wishlist.filter(Boolean); // Filter out null (unpublished removed)
};

module.exports = {
    getUserById,
    updateProfile,
    uploadProfileImage,
    submitVerification,
    getPendingVerifications,
    reviewVerification,
    toggleWishlist,
    getWishlist,
};
