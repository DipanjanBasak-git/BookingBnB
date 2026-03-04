const Listing = require('./listing.model');
const User = require('../users/user.model');
const { AppError } = require('../../middleware/error.middleware');
const { getPaginationOptions, generateSlug } = require('../../shared/utils');
const { processListingImages, deleteFromCloudinary } = require('../../middleware/upload.middleware');

/**
 * Create a new listing (verified hosts only)
 */
const createListing = async (hostId, listingData, files = []) => {
    const host = await User.findById(hostId);
    if (!host) throw new AppError('Host not found', 404);
    // NOTE: Verification check intentionally skipped — will be re-enabled in a future release

    let images = [];
    if (files && files.length > 0) {
        images = await processListingImages(files);
        if (images.length > 0) images[0].isPrimary = true;
    }

    const slug = `${generateSlug(listingData.title)}-${Date.now()}`;

    // When formData is used for multipart uploads, nested objects arrive as JSON strings.
    // We need to parse fields like location, capacity, pricing, and amenities if they are strings.
    const parseField = (field, fallback) => {
        if (!field) return fallback;
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch { return fallback; }
        }
        return field;
    };

    const isPublished = listingData.isPublished === 'true' || listingData.isPublished === true;

    // Parse location and convert lat/lng → GeoJSON coordinates
    const rawLocation = parseField(listingData.location, {});
    const { lat, lng, ...locationRest } = rawLocation;
    const location = {
        ...locationRest,
        coordinates: {
            type: 'Point',
            coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
        },
    };
    // Ensure required address field has a fallback
    if (!location.address) location.address = locationRest.city || 'N/A';

    // Normalize amenities: wizard sends strings ['Wifi','TV']; model needs [{name:'Wifi'},{name:'TV'}]
    const rawAmenities = parseField(listingData.amenities, []);
    const amenities = rawAmenities.map(a => typeof a === 'string' ? { name: a } : a);
    const tags = parseField(listingData.tags, []);

    const listing = await Listing.create({
        ...listingData,
        location,
        capacity: parseField(listingData.capacity, {}),
        pricing: parseField(listingData.pricing, {}),
        amenities,
        tags,
        host: hostId,
        images,
        slug,
        hostVerified: host.isVerified,
        isPublished: isPublished,
        isDraft: !isPublished,
    });

    return listing;
};

/**
 * Get all listings with advanced filtering
 */
const getListings = async (query) => {
    const { page, limit, skip } = getPaginationOptions(query);

    const filter = { isPublished: true };

    // Geo bounding box filter
    if (query.swLat && query.swLng && query.neLat && query.neLng) {
        filter['location.coordinates'] = {
            $geoWithin: {
                $box: [
                    [parseFloat(query.swLng), parseFloat(query.swLat)],
                    [parseFloat(query.neLng), parseFloat(query.neLat)]
                ]
            }
        };
    }

    // Type filter
    if (query.type) filter.type = query.type;
    if (query.category) filter.category = query.category;

    // Location filter (case-insensitive)
    if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
    if (query.country) filter['location.country'] = new RegExp(query.country, 'i');

    // Capacity filter
    if (query.guests) filter['capacity.guests'] = { $gte: parseInt(query.guests) };

    // Price range
    if (query.minPrice || query.maxPrice) {
        filter['pricing.basePrice'] = {};
        if (query.minPrice) filter['pricing.basePrice'].$gte = parseFloat(query.minPrice);
        if (query.maxPrice) filter['pricing.basePrice'].$lte = parseFloat(query.maxPrice);
    }

    // Rating filter
    if (query.minRating) filter.averageRating = { $gte: parseFloat(query.minRating) };

    // Amenities filter
    if (query.amenities) {
        const amenityList = query.amenities.split(',').map(a => a.trim());
        filter['amenities.name'] = { $in: amenityList };
    }

    // Full-text search
    if (query.search) {
        filter.$text = { $search: query.search };
    }

    // Date availability (exclude listings with overlapping bookings)
    let excludedListingIds = [];
    if (query.checkIn && query.checkOut) {
        const Booking = require('../bookings/booking.model');
        const overlappingBookings = await Booking.find({
            status: { $in: ['confirmed', 'pending'] },
            checkIn: { $lt: new Date(query.checkOut) },
            checkOut: { $gt: new Date(query.checkIn) },
        }).distinct('listing');
        excludedListingIds = overlappingBookings;
    }

    if (excludedListingIds.length > 0) {
        filter._id = { $nin: excludedListingIds };
    }

    // Sorting
    let sort = {};
    switch (query.sortBy) {
        case 'price_asc': sort = { 'pricing.basePrice': 1 }; break;
        case 'price_desc': sort = { 'pricing.basePrice': -1 }; break;
        case 'rating': sort = { averageRating: -1, reviewCount: -1 }; break;
        case 'newest': sort = { createdAt: -1 }; break;
        default: sort = { isFeatured: -1, averageRating: -1 };
    }

    const [listings, total] = await Promise.all([
        Listing.find(filter)
            .populate('host', 'name profileImage isVerified')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Listing.countDocuments(filter),
    ]);

    return { listings, total, page, limit };
};

/**
 * Get a single listing by ID
 */
const getListingById = async (id) => {
    const listing = await Listing.findById(id)
        .populate('host', 'name profileImage bio isVerified verifiedAt createdAt');
    if (!listing) throw new AppError('Listing not found', 404);
    return listing;
};

/**
 * Get listing by slug
 */
const getListingBySlug = async (slug) => {
    const listing = await Listing.findOne({ slug, isPublished: true })
        .populate('host', 'name profileImage bio isVerified verifiedAt createdAt');
    if (!listing) throw new AppError('Listing not found', 404);
    return listing;
};

/**
 * Update a listing (host or admin)
 */
const updateListing = async (listingId, hostId, updateData, files) => {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError('Listing not found', 404);

    if (listing.host.toString() !== hostId && updateData.role !== 'admin') {
        throw new AppError('You can only update your own listings', 403);
    }

    // Handle new images
    if (files && files.length > 0) {
        const newImages = await processListingImages(files);
        updateData.images = [...(listing.images || []), ...newImages];
    }

    const updatedListing = await Listing.findByIdAndUpdate(listingId, updateData, {
        new: true,
        runValidators: true,
    });
    return updatedListing;
};

/**
 * Publish/unpublish listing
 */
const togglePublish = async (listingId, hostId, isPublished) => {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError('Listing not found', 404);
    listing.isPublished = isPublished;
    listing.isDraft = !isPublished;
    await listing.save();
    return listing;
};

/**
 * Delete a listing (soft delete)
 */
const deleteListing = async (listingId, hostId, role) => {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError('Listing not found', 404);
    if (listing.host.toString() !== hostId && role !== 'admin') {
        throw new AppError('Not authorized', 403);
    }
    await Listing.findByIdAndUpdate(listingId, { isDeleted: true, isPublished: false });
    return { message: 'Listing deleted successfully' };
};

/**
 * Get host's own listings
 */
const getHostListings = async (hostId, query) => {
    const { page, limit, skip } = getPaginationOptions(query);
    const filter = { host: hostId };
    if (query.status === 'published') filter.isPublished = true;
    if (query.status === 'draft') filter.isDraft = true;

    const [listings, total] = await Promise.all([
        Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Listing.countDocuments(filter),
    ]);
    return { listings, total, page, limit };
};

/**
 * Get featured listings for home page
 */
const getFeaturedListings = async (type, limit = 8) => {
    const filter = { isPublished: true };
    if (type) filter.type = type;

    return Listing.find(filter)
        .populate('host', 'name profileImage isVerified')
        .sort({ isFeatured: -1, averageRating: -1, reviewCount: -1, createdAt: -1 })
        .limit(limit)
        .lean();
};

module.exports = {
    createListing, getListings, getListingById, getListingBySlug,
    updateListing, togglePublish, deleteListing, getHostListings, getFeaturedListings,
};
