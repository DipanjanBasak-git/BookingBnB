const listingService = require('./listing.service');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../../shared/responseFormatter');

const createListing = async (req, res, next) => {
    try {
        const listing = await listingService.createListing(req.user.id, req.body, req.files);
        sendCreated(res, listing, 'Listing created successfully');
    } catch (error) { next(error); }
};

const getListings = async (req, res, next) => {
    try {
        const { listings, total, page, limit } = await listingService.getListings(req.query);
        sendPaginated(res, listings, { total, page, limit }, 'Listings retrieved');
    } catch (error) { next(error); }
};

const getFeaturedListings = async (req, res, next) => {
    try {
        const listings = await listingService.getFeaturedListings(req.query.type, req.query.limit);
        sendSuccess(res, listings, 'Featured listings retrieved');
    } catch (error) { next(error); }
};

const getListingById = async (req, res, next) => {
    try {
        const listing = await listingService.getListingById(req.params.id);
        sendSuccess(res, listing, 'Listing retrieved');
    } catch (error) { next(error); }
};

const getListingBySlug = async (req, res, next) => {
    try {
        const listing = await listingService.getListingBySlug(req.params.slug);
        sendSuccess(res, listing, 'Listing retrieved');
    } catch (error) { next(error); }
};

const updateListing = async (req, res, next) => {
    try {
        const listing = await listingService.updateListing(req.params.id, req.user.id, req.body, req.files);
        sendSuccess(res, listing, 'Listing updated');
    } catch (error) { next(error); }
};

const togglePublish = async (req, res, next) => {
    try {
        const listing = await listingService.togglePublish(req.params.id, req.user.id, req.body.isPublished);
        sendSuccess(res, listing, `Listing ${req.body.isPublished ? 'published' : 'unpublished'}`);
    } catch (error) { next(error); }
};

const deleteListing = async (req, res, next) => {
    try {
        await listingService.deleteListing(req.params.id, req.user.id, req.user.role);
        sendSuccess(res, null, 'Listing deleted');
    } catch (error) { next(error); }
};

const getHostListings = async (req, res, next) => {
    try {
        const { listings, total, page, limit } = await listingService.getHostListings(req.user.id, req.query);
        sendPaginated(res, listings, { total, page, limit }, 'Host listings retrieved');
    } catch (error) { next(error); }
};

module.exports = {
    createListing, getListings, getFeaturedListings, getListingById, getListingBySlug,
    updateListing, togglePublish, deleteListing, getHostListings,
};
