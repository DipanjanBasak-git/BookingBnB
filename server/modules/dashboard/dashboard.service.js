const Booking = require('../bookings/booking.model');
const Listing = require('../listings/listing.model');
const User = require('../users/user.model');
const Review = require('../reviews/review.model');

/**
 * Guest Dashboard – upcoming bookings, past bookings, wishlist stats
 */
const getGuestDashboard = async (guestId) => {
    const now = new Date();

    const [upcomingBookings, pastBookings, totalReviews, wishlistCount] = await Promise.all([
        Booking.find({ guest: guestId, status: 'confirmed', checkIn: { $gte: now } })
            .populate('listing', 'title images location pricing type')
            .sort({ checkIn: 1 }).limit(5),
        Booking.find({ guest: guestId, $or: [{ status: 'completed' }, { checkOut: { $lt: now } }] })
            .populate('listing', 'title images location type')
            .sort({ checkOut: -1 }).limit(5),
        Review.countDocuments({ guest: guestId }),
        User.findById(guestId).select('wishlist'),
    ]);

    const totalSpent = await Booking.aggregate([
        { $match: { guest: require('mongoose').Types.ObjectId.createFromHexString(guestId.toString()), paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
    ]);

    return {
        upcomingBookings,
        pastBookings,
        stats: {
            totalStays: pastBookings.length,
            wishlistCount: wishlistCount?.wishlist?.length || 0,
            reviewsWritten: totalReviews,
            totalSpent: totalSpent[0]?.total || 0,
        },
    };
};

/**
 * Host Dashboard – earnings, bookings, listing stats
 */
const getHostDashboard = async (hostId) => {
    const mongoose = require('mongoose');
    const hostObjectId = mongoose.Types.ObjectId.createFromHexString(hostId.toString());
    const now = new Date();

    // Monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
        listings,
        recentBookings,
        upcomingBookings,
        monthlyEarnings,
        totalStats,
    ] = await Promise.all([
        Listing.find({ host: hostId }).select('title isPublished averageRating reviewCount totalBookings type'),
        Booking.find({ host: hostId }).populate('listing', 'title').populate('guest', 'name profileImage').sort({ createdAt: -1 }).limit(10),
        Booking.find({ host: hostId, status: 'confirmed', checkIn: { $gte: now } }).populate('listing', 'title location').populate('guest', 'name').sort({ checkIn: 1 }).limit(5),
        Booking.aggregate([
            { $match: { host: hostObjectId, paymentStatus: 'paid', paidAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
                    earnings: { $sum: '$pricing.totalPrice' },
                    bookingsCount: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        Booking.aggregate([
            { $match: { host: hostObjectId, paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalPrice' }, totalBookings: { $sum: 1 } } },
        ]),
    ]);

    return {
        listings,
        recentBookings,
        upcomingBookings,
        monthlyEarnings: monthlyEarnings.map(item => ({
            year: item._id.year,
            month: item._id.month,
            earnings: Math.round(item.earnings),
            bookings: item.bookingsCount,
        })),
        stats: {
            totalListings: listings.length,
            publishedListings: listings.filter(l => l.isPublished).length,
            totalRevenue: Math.round(totalStats[0]?.totalRevenue || 0),
            totalBookings: totalStats[0]?.totalBookings || 0,
        },
    };
};

/**
 * Admin Dashboard
 */
const getAdminDashboard = async () => {
    const mongoose = require('mongoose');
    const [userStats, listingStats, bookingStats, revenueStats, pendingHosts] = await Promise.all([
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        Listing.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, published: { $sum: { $cond: ['$isPublished', 1, 0] } } } },
        ]),
        Booking.countDocuments({ status: { $in: ['confirmed', 'pending'] } }),
        Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
        ]),
        User.countDocuments({ role: 'host', verificationStatus: 'pending' }),
    ]);

    return {
        users: userStats,
        listings: listingStats,
        activeBookings: bookingStats,
        totalRevenue: Math.round(revenueStats[0]?.total || 0),
        pendingHostVerifications: pendingHosts,
    };
};

module.exports = { getGuestDashboard, getHostDashboard, getAdminDashboard };
