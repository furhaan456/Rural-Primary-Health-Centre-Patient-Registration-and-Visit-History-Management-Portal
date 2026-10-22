const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  visit_code: { type: String, required: true },
  patient_id: { type: Number, required: true, ref: 'Patient' },
  doctor_id: { type: Number, required: true, ref: 'User' },
  receptionist_id: { type: Number, required: true, ref: 'User' },
  visit_date: { type: String, required: true },
  chief_complaint: { type: String, required: true },
  temp_celsius: { type: Number, default: null },
  bp_systolic: { type: Number, default: null },
  bp_diastolic: { type: Number, default: null },
  pulse_rate: { type: Number, default: null },
  weight_kg: { type: Number, default: null },
  diagnosis: { type: String, default: null },
  status: { type: String, enum: ['waiting', 'in_consultation', 'completed', 'cancelled'], default: 'waiting' }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
