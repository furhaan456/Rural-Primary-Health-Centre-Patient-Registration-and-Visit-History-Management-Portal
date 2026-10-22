// Express Router for authentication routes (/api/auth)
const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/register', verifyToken, authorizeRoles('admin'), register);

module.exports = router;
