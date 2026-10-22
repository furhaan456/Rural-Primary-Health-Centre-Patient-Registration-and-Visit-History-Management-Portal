// Express Router for Prescription endpoints (/api/prescriptions)
const express = require('express');
const router = express.Router();
const { addPrescription, getPrescriptionByVisit } = require('../controllers/prescriptionController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get prescription for a visit (All logged-in staff)
router.get('/visit/:visitId', verifyToken, getPrescriptionByVisit);

// Create prescription (Doctor only)
router.post('/', verifyToken, authorizeRoles('admin', 'doctor'), addPrescription);

module.exports = router;
