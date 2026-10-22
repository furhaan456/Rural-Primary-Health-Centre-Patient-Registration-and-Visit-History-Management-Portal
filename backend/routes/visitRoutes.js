// Express Router for Visit endpoints (/api/visits)
const express = require('express');
const router = express.Router();
const { createVisit, getTodayQueue, getPatientVisits, updateVisitDiagnosis } = require('../controllers/visitController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get today's active queue (Doctor, Receptionist, Admin)
router.get('/queue/today', verifyToken, getTodayQueue);

// Get visit history for a specific patient
router.get('/patient/:patientId', verifyToken, getPatientVisits);

// Create today's visit (Receptionist, Admin)
router.post('/', verifyToken, authorizeRoles('admin', 'receptionist'), createVisit);

// Record diagnosis (Doctor, Admin)
router.put('/:id/diagnosis', verifyToken, authorizeRoles('admin', 'doctor'), updateVisitDiagnosis);

module.exports = router;
