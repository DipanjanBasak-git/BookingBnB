const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: [true, 'Listing reference is required'],
            index: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Booking reference is required'],
        },
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Guest reference is required'],
            index: true,
        },

        // Rating breakdown
        rating: {
            overall: { type: Number, required: true, min: 1, max: 5 },
            cleanliness: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
            checkIn: { type: Number, min: 1, max: 5 },
            accuracy: { type: Number, min: 1, max: 5 },
            location: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 },
        },

        comment: {
            type: String,
            required: [true, 'Review comment is required'],
            minlength: [10, 'Review must be at least 10 characters'],
            maxlength: [1000, 'Review cannot exceed 1000 characters'],
        },

        // Host reply
        hostReply: {
            text: {
                type: String,
                maxlength: [500, 'Host reply cannot exceed 500 characters'],
            },
            repliedAt: Date,
        },

        // Edit tracking – guest can edit once
        editedOnce: {
            type: Boolean,
            default: false,
        },
        editedAt: Date,

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ guest: 1, listing: 1 }, { unique: true }); // One review per listing per guest

// ─── Pre-save: Exclude deleted ────────────────────────────────────────────────
reviewSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.where({ isDeleted: false });
    }
    next();
});

// ─── Post-save: Auto-update listing rating ────────────────────────────────────
reviewSchema.post('save', async function () {
    await this.constructor.updateListingRating(this.listing);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        await doc.constructor.updateListingRating(doc.listing);
    }
});

// ─── Static: Update listing average rating ────────────────────────────────────
reviewSchema.statics.updateListingRating = async function (listingId) {
    const Listing = mongoose.model('Listing');

    const stats = await this.aggregate([
        { $match: { listing: listingId, isDeleted: false } },
        {
            $group: {
                _id: '$listing',
                avgRating: { $avg: '$rating.overall' },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Listing.findByIdAndUpdate(listingId, {
            averageRating: parseFloat(stats[0].avgRating.toFixed(2)),
            reviewCount: stats[0].count,
        });
    } else {
        await Listing.findByIdAndUpdate(listingId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
