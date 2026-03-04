const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: String,
}, { _id: false });

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
}, { _id: false });

const priceSchema = new mongoose.Schema({
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    priceType: {
        type: String,
        enum: ['per_night', 'per_person', 'flat'],
        default: 'per_night',
    },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
}, { _id: false });

const locationSchema = new mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: String,
    country: { type: String, required: true },
    zip: String,
    coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
}, { _id: false });

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [20, 'Description must be at least 20 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },

        // Category system
        type: {
            type: String,
            enum: ['property', 'experience', 'service'],
            required: [true, 'Listing type is required'],
            index: true,
        },
        category: {
            type: String,
            enum: [
                // Properties
                'hotel', 'villa', 'apartment', 'cabin', 'treehouse', 'houseboat',
                'cottage', 'farmstay', 'penthouse', 'resort', 'hostel',
                // Experiences
                'tour', 'event', 'workshop', 'adventure', 'astronomy', 'cooking', 'wellness',
                // Services
                'chef', 'photographer', 'guide', 'wellness', 'photography', 'entertainment',
            ],
            required: [true, 'Category is required'],
            index: true,
        },

        // Host reference
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Location
        location: {
            type: locationSchema,
            required: true,
        },

        // Capacity
        capacity: {
            guests: { type: Number, required: true, min: 1 },
            bedrooms: Number,
            beds: Number,
            bathrooms: Number,
        },

        // Pricing
        pricing: {
            type: priceSchema,
            required: true,
        },

        // Images
        images: {
            type: [imageSchema],
            validate: {
                validator: function (v) {
                    return this.isNew ? true : v.length >= 1;
                },
                message: 'At least one image is required for published listings',
            },
        },

        // Amenities
        amenities: [amenitySchema],

        // Availability (excluded dates ranges booked)
        availabilityConfig: {
            minNights: { type: Number, default: 1 },
            maxNights: { type: Number, default: 365 },
            instantBook: { type: Boolean, default: false },
            checkInTime: { type: String, default: '15:00' },
            checkOutTime: { type: String, default: '11:00' },
        },

        // Ratings (auto-updated)
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            index: true,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },

        // Status
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
        },
        isDraft: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Verification badge (inherited from host)
        hostVerified: {
            type: Boolean,
            default: false,
        },

        // Tags
        tags: [String],

        // Statistics
        totalBookings: {
            type: Number,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            default: 0,
        },

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

// ─── Compound Indexes ─────────────────────────────────────────────────────────
listingSchema.index({ type: 1, category: 1 });
listingSchema.index({ 'location.city': 1, type: 1 });
listingSchema.index({ averageRating: -1, reviewCount: -1 });
listingSchema.index({ 'pricing.basePrice': 1 });
listingSchema.index({ isPublished: 1, isDeleted: 1 });
listingSchema.index({ host: 1, isPublished: 1 });
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index(
    { title: 'text', description: 'text', 'location.city': 'text' },
    { weights: { title: 10, 'location.city': 5, description: 1 } }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
listingSchema.virtual('primaryImage').get(function () {
    if (this.images && this.images.length > 0) {
        return this.images.find(img => img.isPrimary) || this.images[0];
    }
    return null;
});

listingSchema.virtual('displayPrice').get(function () {
    return this.pricing?.basePrice || 0;
});

// ─── Pre-save ─────────────────────────────────────────────────────────────────
listingSchema.pre('save', function (next) {
    if (this.isNew && !this.slug) {
        const { generateSlug } = require('../../shared/utils');
        this.slug = `${generateSlug(this.title)}-${Date.now()}`;
    }
    next();
});

// ─── Query helper: exclude deleted ────────────────────────────────────────────
listingSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.where({ isDeleted: false });
    }
    next();
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
