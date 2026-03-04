const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: [true, 'Listing is required'],
            index: true,
        },
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Guest is required'],
            index: true,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Host is required'],
        },

        // Dates
        checkIn: {
            type: Date,
            required: [true, 'Check-in date is required'],
        },
        checkOut: {
            type: Date,
            required: [true, 'Check-out date is required'],
        },

        // Guests
        guests: {
            adults: { type: Number, default: 1, min: 1 },
            children: { type: Number, default: 0, min: 0 },
            infants: { type: Number, default: 0, min: 0 },
        },
        totalGuests: {
            type: Number,
            required: true,
        },

        // Pricing snapshot (at time of booking)
        pricing: {
            basePrice: Number,
            nights: Number,
            subtotal: Number,
            cleaningFee: { type: Number, default: 0 },
            serviceFee: { type: Number, default: 0 },
            totalPrice: { type: Number, required: true },
            currency: { type: String, default: 'INR' },
        },

        // Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
            default: 'pending',
            index: true,
        },

        // Payment
        paymentStatus: {
            type: String,
            enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        paymentIntentId: String,
        paymentOrderId: String,
        paymentProvider: {
            type: String,
            enum: ['razorpay', 'stripe', 'mock'],
            default: 'mock',
        },
        paidAt: Date,

        // Cancellation
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        cancelledAt: Date,
        cancellationReason: String,

        // Confirmation number
        confirmationCode: {
            type: String,
            unique: true,
        },

        // Guest special requests
        specialRequests: {
            type: String,
            maxlength: 500,
        },

        // Review reference
        review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        },
        isReviewed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 }); // Core overlap check index
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
bookingSchema.virtual('nights').get(function () {
    if (this.checkIn && this.checkOut) {
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.ceil((this.checkOut - this.checkIn) / msPerDay);
    }
    return 0;
});

bookingSchema.virtual('isUpcoming').get(function () {
    return this.status === 'confirmed' && this.checkIn > new Date();
});

bookingSchema.virtual('isPast').get(function () {
    return this.status === 'completed' || (this.checkOut < new Date() && this.status === 'confirmed');
});

// ─── Pre-save ─────────────────────────────────────────────────────────────────
bookingSchema.pre('save', function (next) {
    if (this.isNew && !this.confirmationCode) {
        this.confirmationCode = `BNB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    next();
});

// ─── Validation ───────────────────────────────────────────────────────────────
bookingSchema.pre('validate', function (next) {
    if (this.checkOut <= this.checkIn) {
        this.invalidate('checkOut', 'Check-out must be after check-in');
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
