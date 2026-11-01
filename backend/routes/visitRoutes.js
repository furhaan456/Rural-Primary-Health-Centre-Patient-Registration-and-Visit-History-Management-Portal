// Visit management controller for OPD token queue, vitals, and visit history with MongoDB Atlas support
const express = require('express');
const router = express.Router();
const { createVisit, getTodayQueue, getPatientVisits, updateVisitDiagnosis, getVisitById, reassignDoctor } = require('../controllers/visitController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get today's active queue (Doctor, Receptionist, Admin)
router.get('/queue/today', verifyToken, getTodayQueue);

// Get visit history for a specific patient
router.get('/patient/:patientId', verifyToken, getPatientVisits);

// Get specific visit by ID (Doctor, Receptionist, Admin)
router.get('/:id', verifyToken, getVisitById);

// Create today's visit (Receptionist, Admin)
router.post('/', verifyToken, authorizeRoles('admin', 'receptionist'), createVisit);

// Record diagnosis (Doctor, Admin)
router.put('/:id/diagnosis', verifyToken, authorizeRoles('admin', 'doctor'), updateVisitDiagnosis);

// Reassign doctor for a visit (Admin only)
router.put('/:id/reassign-doctor', verifyToken, authorizeRoles('admin'), reassignDoctor);

module.exports = router;
