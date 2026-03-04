const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../shared/responseFormatter');

const getGuestDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getGuestDashboard(req.user.id);
        sendSuccess(res, data, 'Guest dashboard retrieved');
    } catch (error) { next(error); }
};

const getHostDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getHostDashboard(req.user.id);
        sendSuccess(res, data, 'Host dashboard retrieved');
    } catch (error) { next(error); }
};

const getAdminDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getAdminDashboard();
        sendSuccess(res, data, 'Admin dashboard retrieved');
    } catch (error) { next(error); }
};

module.exports = { getGuestDashboard, getHostDashboard, getAdminDashboard };
