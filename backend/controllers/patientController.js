// Patient management controller handling registration, search, profile, and updates with MongoDB Atlas support
const { getIsConnected, Patient, Village, memoryDb } = require('../config/db');

// Register a new patient
const createPatient = async (req, res) => {
  try {
    const { firstName, lastName, gender, age, phone, address, villageId, emergencyContact } = req.body;

    if (!firstName || !lastName || !gender || !age || !phone || !address || !villageId) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, gender, age, phone, address, and village are required.'
      });
    }

    let nextNum;
    if (getIsConnected()) {
      const count = await Patient.countDocuments();
      nextNum = count + 1;
    } else {
      nextNum = memoryDb.patients.length + 1;
    }

    const patientCode = `PHC-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;

    if (getIsConnected()) {
      await Patient.create({
        id: nextNum,
        patient_code: patientCode,
        first_name: firstName,
        last_name: lastName,
        gender,
        age: Number(age),
        phone,
        address,
        village_id: Number(villageId),
        emergency_contact: emergencyContact || null
      });
    } else {
      memoryDb.patients.push({
        id: nextNum,
        patient_code: patientCode,
        first_name: firstName,
        last_name: lastName,
        gender,
        age: Number(age),
        phone,
        address,
        village_id: Number(villageId),
        emergency_contact: emergencyContact || null,
        created_at: new Date().toISOString()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      patientId: nextNum,
      patientCode
    });
  } catch (error) {
    console.error('Create Patient Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register patient.' });
  }
};

// Search patients by patient code, name, or phone number
const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    const term = q ? q.trim() : '';

    let patients = [];
    let villages = [];

    if (getIsConnected()) {
      villages = await Village.find({}).lean();
      let queryCond = {};
      if (term) {
        queryCond = {
          $or: [
            { patient_code: { $regex: term, $options: 'i' } },
            { first_name: { $regex: term, $options: 'i' } },
            { last_name: { $regex: term, $options: 'i' } },
            { phone: { $regex: term, $options: 'i' } }
          ]
        };
      }
      const docs = await Patient.find(queryCond).sort({ id: -1 }).limit(50).lean();
      patients = docs.map(p => {
        const v = villages.find(vil => vil.id === p.village_id);
        return { ...p, village_name: v ? v.name : 'Unknown Village' };
      });
    } else {
      villages = memoryDb.villages;
      const lowerTerm = term.toLowerCase();
      const filtered = memoryDb.patients.filter(p =>
        !term ||
        p.patient_code.toLowerCase().includes(lowerTerm) ||
        p.first_name.toLowerCase().includes(lowerTerm) ||
        p.last_name.toLowerCase().includes(lowerTerm) ||
        p.phone.includes(lowerTerm)
      );
      patients = filtered.map(p => {
        const v = villages.find(vil => vil.id === p.village_id);
        return { ...p, village_name: v ? v.name : 'Unknown Village' };
      });
    }

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Search Patients Error:', error);
    return res.status(500).json({ success: false, message: 'Error searching patients.' });
  }
};

// Get single patient profile by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientIdNum = Number(id);

    let patient = null;
    let village = null;

    if (getIsConnected()) {
      patient = await Patient.findOne({ id: patientIdNum }).lean();
      if (patient) {
        village = await Village.findOne({ id: patient.village_id }).lean();
      }
    } else {
      patient = memoryDb.patients.find(p => p.id === patientIdNum);
      if (patient) {
        village = memoryDb.villages.find(v => v.id === patient.village_id);
      }
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const patientWithVillage = {
      ...patient,
      village_name: village ? village.name : 'Unknown',
      district: village ? village.district : 'Sundargarh',
      state: village ? village.state : 'Odisha'
    };

    return res.status(200).json({
      success: true,
      patient: patientWithVillage
    });
  } catch (error) {
    console.error('Get Patient Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving patient profile.' });
  }
};

// Update patient details
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientIdNum = Number(id);
    const { firstName, lastName, gender, age, phone, address, villageId, emergencyContact } = req.body;

    if (getIsConnected()) {
      await Patient.updateOne(
        { id: patientIdNum },
        {
          $set: {
            first_name: firstName,
            last_name: lastName,
            gender,
            age: Number(age),
            phone,
            address,
            village_id: Number(villageId),
            emergency_contact: emergencyContact || null
          }
        }
      );
    } else {
      const pIndex = memoryDb.patients.findIndex(p => p.id === patientIdNum);
      if (pIndex !== -1) {
        memoryDb.patients[pIndex] = {
          ...memoryDb.patients[pIndex],
          first_name: firstName,
          last_name: lastName,
          gender,
          age: Number(age),
          phone,
          address,
          village_id: Number(villageId),
          emergency_contact: emergencyContact || null
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully.'
    });
  } catch (error) {
    console.error('Update Patient Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update patient profile.' });
  }
};

// Get list of villages for selection dropdowns
const getVillages = async (req, res) => {
  try {
    let villages = [];
    if (getIsConnected()) {
      villages = await Village.find({}).sort({ name: 1 }).lean();
    } else {
      villages = memoryDb.villages;
    }
    return res.status(200).json({ success: true, villages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch villages.' });
  }
};

module.exports = { createPatient, searchPatients, getPatientById, updatePatient, getVillages };
