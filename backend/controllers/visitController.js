// Visit management controller for OPD token queue, vitals, and visit history with MongoDB Atlas support
const { getIsConnected, Visit, Patient, User, memoryDb } = require('../config/db');

// Create today's OPD visit token
const createVisit = async (req, res) => {
  try {
    const { patientId, doctorId, chiefComplaint, tempCelsius, bpSystolic, bpDiastolic, pulseRate, weightKg } = req.body;
    const receptionistId = req.user.id;

    if (!patientId || !doctorId || !chiefComplaint) {
      return res.status(400).json({ success: false, message: 'Patient, Doctor, and Chief Complaint are required.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    let tokenNum = 1;
    let nextVisitId = 1;

    if (getIsConnected()) {
      const todayCount = await Visit.countDocuments({ visit_date: todayStr });
      tokenNum = todayCount + 1;
      const totalCount = await Visit.countDocuments();
      nextVisitId = totalCount + 1;
    } else {
      const todayVisits = memoryDb.visits.filter(v => v.visit_date === todayStr);
      tokenNum = todayVisits.length + 1;
      nextVisitId = memoryDb.visits.length + 1;
    }

    const visitCode = `VST-${todayStr.replace(/-/g, '')}-${String(tokenNum).padStart(3, '0')}`;

    const newVisitObj = {
      id: nextVisitId,
      visit_code: visitCode,
      patient_id: Number(patientId),
      doctor_id: Number(doctorId),
      receptionist_id: Number(receptionistId),
      visit_date: todayStr,
      chief_complaint: chiefComplaint,
      temp_celsius: tempCelsius ? Number(tempCelsius) : null,
      bp_systolic: bpSystolic ? Number(bpSystolic) : null,
      bp_diastolic: bpDiastolic ? Number(bpDiastolic) : null,
      pulse_rate: pulseRate ? Number(pulseRate) : null,
      weight_kg: weightKg ? Number(weightKg) : null,
      status: 'waiting'
    };

    if (getIsConnected()) {
      await Visit.create(newVisitObj);
    } else {
      memoryDb.visits.push({ ...newVisitObj, created_at: new Date().toISOString() });
    }

    return res.status(201).json({
      success: true,
      message: 'OPD Visit created successfully.',
      visitId: nextVisitId,
      tokenNumber: tokenNum,
      visitCode
    });
  } catch (error) {
    console.error('Create Visit Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create visit record.' });
  }
};

// Get today's active patient OPD queue
const getTodayQueue = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let queue = [];

    if (getIsConnected()) {
      const rawVisits = await Visit.find({ visit_date: todayStr }).sort({ id: 1 }).lean();
      const patients = await Patient.find({}).lean();
      const users = await User.find({}).lean();

      queue = rawVisits.map(v => {
        const p = patients.find(pat => pat.id === v.patient_id) || {};
        const doc = users.find(u => u.id === v.doctor_id) || {};
        return {
          ...v,
          patient_code: p.patient_code,
          first_name: p.first_name,
          last_name: p.last_name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          doctor_name: doc.full_name || 'Dr. Ananya Roy'
        };
      });
    } else {
      queue = memoryDb.visits.filter(v => v.visit_date === todayStr).map(v => {
        const p = memoryDb.patients.find(pat => pat.id === v.patient_id) || {};
        const doc = memoryDb.users.find(u => u.id === v.doctor_id) || {};
        return {
          ...v,
          patient_code: p.patient_code,
          first_name: p.first_name,
          last_name: p.last_name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          doctor_name: doc.full_name || 'Dr. Ananya Roy'
        };
      });
    }

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (error) {
    console.error('Get Today Queue Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch OPD queue.' });
  }
};

// Get all past visits for a specific patient
const getPatientVisits = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patIdNum = Number(patientId);

    let visits = [];

    if (getIsConnected()) {
      const rawVisits = await Visit.find({ patient_id: patIdNum }).sort({ id: -1 }).lean();
      const users = await User.find({}).lean();

      visits = rawVisits.map(v => {
        const doc = users.find(u => u.id === v.doctor_id) || {};
        return {
          ...v,
          doctor_name: doc.full_name || 'Doctor'
        };
      });
    } else {
      const rawVisits = memoryDb.visits.filter(v => v.patient_id === patIdNum);
      visits = rawVisits.map(v => {
        const doc = memoryDb.users.find(u => u.id === v.doctor_id) || {};
        return {
          ...v,
          doctor_name: doc.full_name || 'Doctor'
        };
      });
    }

    return res.status(200).json({
      success: true,
      visits
    });
  } catch (error) {
    console.error('Get Patient Visits Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visit history.' });
  }
};

// Update visit with doctor diagnosis and complete status
const updateVisitDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const visitIdNum = Number(id);
    const { diagnosis, status } = req.body;

    if (getIsConnected()) {
      await Visit.updateOne(
        { id: visitIdNum },
        { $set: { diagnosis, status: status || 'completed' } }
      );
    } else {
      const vIndex = memoryDb.visits.findIndex(v => v.id === visitIdNum);
      if (vIndex !== -1) {
        memoryDb.visits[vIndex].diagnosis = diagnosis;
        memoryDb.visits[vIndex].status = status || 'completed';
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Diagnosis and consultation completed successfully.'
    });
  } catch (error) {
    console.error('Update Diagnosis Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record diagnosis.' });
  }
};

module.exports = { createVisit, getTodayQueue, getPatientVisits, updateVisitDiagnosis };
