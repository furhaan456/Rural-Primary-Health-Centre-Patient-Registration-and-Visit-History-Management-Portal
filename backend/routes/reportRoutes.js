// Express Router for Reports endpoints (/api/reports)
const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get overall stats and analytics (Admin only)
router.get('/overview', verifyToken, authorizeRoles('admin', 'doctor', 'receptionist'), getOverviewStats);

module.exports = router;
