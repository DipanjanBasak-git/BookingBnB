const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.get('/guest', authMiddleware, requireRole('guest', 'admin'), dashboardController.getGuestDashboard);
router.get('/host', authMiddleware, requireRole('host', 'admin'), dashboardController.getHostDashboard);
router.get('/admin', authMiddleware, requireRole('admin'), dashboardController.getAdminDashboard);

module.exports = router;
