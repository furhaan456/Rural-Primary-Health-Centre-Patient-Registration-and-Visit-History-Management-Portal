// Express Router for Patient REST endpoints (/api/patients)
const express = require('express');
const router = express.Router();
const { createPatient, searchPatients, getPatientById, updatePatient, getVillages } = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get list of villages (all logged-in users)
router.get('/villages', verifyToken, getVillages);

// Search patients (all logged-in users)
router.get('/search', verifyToken, searchPatients);

// Get patient by ID (all logged-in users)
router.get('/:id', verifyToken, getPatientById);

// Create patient (receptionist or admin)
router.post('/', verifyToken, authorizeRoles('admin', 'receptionist'), createPatient);

// Update patient (receptionist or admin)
router.put('/:id', verifyToken, authorizeRoles('admin', 'receptionist'), updatePatient);

module.exports = router;
