/**
 * Standardized API Response Formatter
 * All API responses follow: { success, data, message, meta }
 */

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message,
        data,
    };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
};

const sendCreated = (res, data, message = 'Created successfully') => {
    return sendSuccess(res, data, message, 201);
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
    return sendSuccess(res, data, message, 200, {
        pagination: {
            total: pagination.total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrev: pagination.page > 1,
        },
    });
};

module.exports = {
    sendSuccess,
    sendCreated,
    sendError,
    sendPaginated,
};
