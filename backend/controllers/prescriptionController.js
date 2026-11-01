// Prescription controller for creating electronic prescriptions and items with MongoDB Atlas support
const { getIsConnected, Prescription, Visit, User, memoryDb } = require('../config/db');

// Add prescription for a visit (Doctor only)
const addPrescription = async (req, res) => {
  try {
    const { visitId, patientId, doctorId, notes, items } = req.body;
    const docId = doctorId || req.user.id;

    if (!visitId || (!patientId && !visitId) || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Visit ID, Patient ID, and prescription medicines are required.' });
    }

    // Resolve accurate patientId from Visit record if available
    let effectivePatientId = patientId ? Number(patientId) : null;
    if (visitId) {
      const vId = Number(visitId);
      let v = null;
      if (getIsConnected()) {
        v = await Visit.findOne({ id: vId }).lean();
      } else {
        v = memoryDb.visits.find(item => item.id === vId);
      }
      if (v && v.patient_id) {
        effectivePatientId = Number(v.patient_id);
      }
    }

    let prescriptionId = 1;

    const formattedItems = items.map(item => ({
      medicine_name: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration_days: Number(item.durationDays),
      instructions: item.instructions || null
    }));

    if (getIsConnected()) {
      const count = await Prescription.countDocuments();
      prescriptionId = count + 1;

      await Prescription.create({
        id: prescriptionId,
        visit_id: Number(visitId),
        patient_id: effectivePatientId,
        doctor_id: Number(docId),
        notes: notes || null,
        items: formattedItems
      });

      await Visit.updateOne({ id: Number(visitId) }, { $set: { status: 'completed' } });
    } else {
      prescriptionId = memoryDb.prescriptions.length + 1;
      memoryDb.prescriptions.push({
        id: prescriptionId,
        visit_id: Number(visitId),
        patient_id: effectivePatientId,
        doctor_id: Number(docId),
        notes: notes || null,
        items: formattedItems
      });

      const v = memoryDb.visits.find(vis => vis.id === Number(visitId));
      if (v) v.status = 'completed';
    }

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully.',
      prescriptionId
    });
  } catch (error) {
    console.error('Add Prescription Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record prescription.' });
  }
};

// Get prescription details for a specific visit
const getPrescriptionByVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const vIdNum = Number(visitId);

    let prescription = null;

    if (getIsConnected()) {
      const rawPres = await Prescription.findOne({ visit_id: vIdNum }).lean();
      if (rawPres) {
        const doc = await User.findOne({ id: rawPres.doctor_id }).lean();
        prescription = {
          ...rawPres,
          doctor_name: doc ? doc.full_name : 'Doctor'
        };
      }
    } else {
      const rawPres = memoryDb.prescriptions.find(p => p.visit_id === vIdNum);
      if (rawPres) {
        const doc = memoryDb.users.find(u => u.id === rawPres.doctor_id);
        prescription = {
          ...rawPres,
          doctor_name: doc ? doc.full_name : 'Doctor'
        };
      }
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'No prescription found for this visit.' });
    }

    return res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get Prescription Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve prescription.' });
  }
};

module.exports = { addPrescription, getPrescriptionByVisit };
