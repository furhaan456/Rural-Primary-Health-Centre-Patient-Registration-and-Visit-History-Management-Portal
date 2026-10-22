// Express Router for Doctor endpoints (/api/doctors)
const express = require('express');
const router = express.Router();
const { getDoctors, createDoctor } = require('../controllers/doctorController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get list of doctors (All logged-in staff)
router.get('/', verifyToken, getDoctors);

// Create doctor account (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), createDoctor);

module.exports = router;
