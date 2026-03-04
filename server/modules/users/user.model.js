const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in queries by default
        },
        role: {
            type: String,
            enum: ['guest', 'host', 'admin'],
            default: 'guest',
        },

        // Profile
        profileImage: {
            url: String,
            publicId: String,
        },
        phone: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zip: String,
        },

        // Host Verification
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationStatus: {
            type: String,
            enum: ['unsubmitted', 'pending', 'approved', 'rejected'],
            default: 'unsubmitted',
        },
        idProof: {
            url: String,
            publicId: String,
            submittedAt: Date,
        },
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectionReason: String,

        // Guest wishlist
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
        }],

        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: Date,

        // Password reset
        resetPasswordToken: String,
        resetPasswordExpires: Date,

        // Email verification
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: email unique index is already created by `unique: true` in the field definition
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1, role: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('displayName').get(function () {
    return this.name;
});

// ─── Pre-save: Hash Password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.emailVerificationToken;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
