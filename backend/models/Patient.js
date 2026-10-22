const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  patient_code: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  village_id: { type: Number, required: true, ref: 'Village' },
  emergency_contact: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
