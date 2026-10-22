// Follow-up management controller for scheduling and viewing upcoming patient follow-ups with MongoDB Atlas support
const { getIsConnected, FollowUp, Patient, User, memoryDb } = require('../config/db');

// Schedule a follow-up appointment
const createFollowUp = async (req, res) => {
  try {
    const { patientId, doctorId, visitId, followUpDate, reason } = req.body;
    const docId = doctorId || req.user.id;

    if (!patientId || !visitId || !followUpDate || !reason) {
      return res.status(400).json({ success: false, message: 'Patient ID, Visit ID, date, and reason are required.' });
    }

    let followUpId = 1;

    if (getIsConnected()) {
      const count = await FollowUp.countDocuments();
      followUpId = count + 1;
      await FollowUp.create({
        id: followUpId,
        patient_id: Number(patientId),
        doctor_id: Number(docId),
        visit_id: Number(visitId),
        follow_up_date: followUpDate,
        reason,
        status: 'pending'
      });
    } else {
      followUpId = memoryDb.follow_ups.length + 1;
      memoryDb.follow_ups.push({
        id: followUpId,
        patient_id: Number(patientId),
        doctor_id: Number(docId),
        visit_id: Number(visitId),
        follow_up_date: followUpDate,
        reason,
        status: 'pending'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Follow-up appointment scheduled successfully.',
      followUpId
    });
  } catch (error) {
    console.error('Create Follow-Up Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule follow-up.' });
  }
};

// List upcoming follow-ups
const getUpcomingFollowUps = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    let followUps = [];

    if (getIsConnected()) {
      const rawFollowUps = await FollowUp.find({ follow_up_date: { $gte: todayStr } }).sort({ follow_up_date: 1 }).limit(50).lean();
      const patients = await Patient.find({}).lean();
      const users = await User.find({}).lean();

      followUps = rawFollowUps.map(f => {
        const p = patients.find(pat => pat.id === f.patient_id) || {};
        const u = users.find(usr => usr.id === f.doctor_id) || {};
        return {
          ...f,
          patient_code: p.patient_code,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          doctor_name: u.full_name || 'Doctor'
        };
      });
    } else {
      const rawFollowUps = memoryDb.follow_ups.filter(f => f.follow_up_date >= todayStr);
      followUps = rawFollowUps.map(f => {
        const p = memoryDb.patients.find(pat => pat.id === f.patient_id) || {};
        const u = memoryDb.users.find(usr => usr.id === f.doctor_id) || {};
        return {
          ...f,
          patient_code: p.patient_code,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          doctor_name: u.full_name || 'Doctor'
        };
      });
    }

    return res.status(200).json({
      success: true,
      count: followUps.length,
      followUps
    });
  } catch (error) {
    console.error('Get Upcoming Follow-Ups Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve follow-up appointments.' });
  }
};

module.exports = { createFollowUp, getUpcomingFollowUps };
