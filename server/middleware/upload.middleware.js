const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { AppError } = require('./error.middleware');

// Memory storage – files go directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only JPEG, JPG, PNG, and WebP images are allowed', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10,
    },
});

/**
 * Upload a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'bookingbnb', options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 1200, height: 800, crop: 'fill' },
                ],
                ...options,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Process multiple file uploads to Cloudinary
 */
const processListingImages = async (files, folder = 'bookingbnb/listings') => {
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, folder));
    const results = await Promise.all(uploadPromises);
    return results.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
    }));
};

/**
 * Delete an image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
    upload,
    uploadToCloudinary,
    processListingImages,
    deleteFromCloudinary,
};
