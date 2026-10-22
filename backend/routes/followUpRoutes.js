// Express Router for Follow-up endpoints (/api/follow-ups)
const express = require('express');
const router = express.Router();
const { createFollowUp, getUpcomingFollowUps } = require('../controllers/followUpController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get upcoming follow-ups (All logged-in staff)
router.get('/upcoming', verifyToken, getUpcomingFollowUps);

// Schedule follow-up (Doctor or Admin)
router.post('/', verifyToken, authorizeRoles('admin', 'doctor'), createFollowUp);

module.exports = router;
