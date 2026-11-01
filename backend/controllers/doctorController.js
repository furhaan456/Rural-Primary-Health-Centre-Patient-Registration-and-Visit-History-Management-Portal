// Doctor management controller for Admin staff operations with MongoDB Atlas support
const bcrypt = require('bcryptjs');
const { getIsConnected, User, Doctor, memoryDb } = require('../config/db');

// List all doctors
const getDoctors = async (req, res) => {
  try {
    let doctors = [];

    if (getIsConnected()) {
      const userDocs = await User.find({ role: 'doctor' }).sort({ id: -1 }).lean();
      const doctorProfiles = await Doctor.find({}).lean();

      doctors = userDocs.map(u => {
        const d = doctorProfiles.find(doc => doc.user_id === u.id) || {};
        return {
          user_id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          status: u.status,
          doctor_id: d.id || null,
          qualification: d.qualification || 'MBBS',
          specialization: d.specialization || 'General Physician',
          license_number: d.license_number || 'MED-OR-REG-01'
        };
      });
    } else {
      const userDocs = memoryDb.users.filter(u => u.role === 'doctor');
      doctors = userDocs.map(u => {
        const d = memoryDb.doctors.find(doc => doc.user_id === u.id) || {};
        return {
          user_id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          status: u.status,
          doctor_id: d.id || null,
          qualification: d.qualification || 'MBBS',
          specialization: d.specialization || 'General Physician',
          license_number: d.license_number || 'MED-OR-REG-01'
        };
      });
    }

    return res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Get Doctors Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctor list.' });
  }
};

// Create a doctor account and profile (Admin only)
const createDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phone, qualification, specialization, licenseNumber } = req.body;

    if (!fullName || !email || !password || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'Full name, email, password, and license number are required.' });
    }

    let existing = null;
    if (getIsConnected()) {
      existing = await User.findOne({ email });
    } else {
      existing = memoryDb.users.find(u => u.email === email);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let userId = 1;
    let docProfileId = 1;

    if (getIsConnected()) {
      const uCount = await User.countDocuments();
      userId = uCount + 1;

      await User.create({
        id: userId,
        full_name: fullName,
        email,
        password_hash: passwordHash,
        role: 'doctor',
        phone: phone || null,
        status: 'active'
      });

      const dCount = await Doctor.countDocuments();
      docProfileId = dCount + 1;

      await Doctor.create({
        id: docProfileId,
        user_id: userId,
        qualification: qualification || 'MBBS',
        specialization: specialization || 'General Physician',
        license_number: licenseNumber,
        phone: phone || null
      });
    } else {
      userId = memoryDb.users.length + 1;
      memoryDb.users.push({
        id: userId,
        full_name: fullName,
        email,
        password_hash: passwordHash,
        role: 'doctor',
        phone: phone || null,
        status: 'active'
      });

      docProfileId = memoryDb.doctors.length + 1;
      memoryDb.doctors.push({
        id: docProfileId,
        user_id: userId,
        qualification: qualification || 'MBBS',
        specialization: specialization || 'General Physician',
        license_number: licenseNumber,
        phone: phone || null
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      userId
    });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register doctor.' });
  }
};

// Toggle doctor active/inactive status (Admin only)
const toggleDoctorStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);

    if (getIsConnected()) {
      const doctor = await User.findOne({ id: userIdNum, role: 'doctor' }).lean();
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
      const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
      await User.updateOne({ id: userIdNum }, { $set: { status: newStatus } });
      return res.status(200).json({ success: true, message: `Doctor marked as ${newStatus}.`, status: newStatus });
    } else {
      const idx = memoryDb.users.findIndex(u => u.id === userIdNum && u.role === 'doctor');
      if (idx === -1) return res.status(404).json({ success: false, message: 'Doctor not found.' });
      const newStatus = memoryDb.users[idx].status === 'active' ? 'inactive' : 'active';
      memoryDb.users[idx].status = newStatus;
      return res.status(200).json({ success: true, message: `Doctor marked as ${newStatus}.`, status: newStatus });
    }
  } catch (error) {
    console.error('Toggle Doctor Status Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update doctor status.' });
  }
};

module.exports = { getDoctors, createDoctor, toggleDoctorStatus };
