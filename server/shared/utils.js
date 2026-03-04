/**
 * Shared Utils – date helpers, pagination, slug generation
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Check if two date ranges overlap
 * Two bookings overlap if: checkIn < existingCheckOut AND checkOut > existingCheckIn
 */
const datesOverlap = (checkIn, checkOut, existingCheckIn, existingCheckOut) => {
    const newIn = new Date(checkIn);
    const newOut = new Date(checkOut);
    const exIn = new Date(existingCheckIn);
    const exOut = new Date(existingCheckOut);
    return newIn < exOut && newOut > exIn;
};

/**
 * Validate check-in/check-out: checkOut must be after checkIn
 */
const isValidDateRange = (checkIn, checkOut) => {
    return new Date(checkOut) > new Date(checkIn);
};

/**
 * Calculate number of nights between two dates
 */
const calculateNights = (checkIn, checkOut) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay);
};

/**
 * Calculate total price
 */
const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
    const nights = calculateNights(checkIn, checkOut);
    return parseFloat((pricePerNight * nights).toFixed(2));
};

/**
 * Generate pagination meta from query
 */
const getPaginationOptions = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 12, 50);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Generate a URL-friendly slug from a string
 */
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Generate a unique transaction ID
 */
const generateTransactionId = () => {
    return `TXN_${Date.now()}_${uuidv4().split('-')[0].toUpperCase()}`;
};

/**
 * Pick specified fields from an object
 */
const pick = (obj, fields) => {
    return fields.reduce((acc, field) => {
        if (obj[field] !== undefined) acc[field] = obj[field];
        return acc;
    }, {});
};

module.exports = {
    datesOverlap,
    isValidDateRange,
    calculateNights,
    calculateTotalPrice,
    getPaginationOptions,
    generateSlug,
    generateTransactionId,
    pick,
};
