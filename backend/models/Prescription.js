const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicine_name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration_days: { type: Number, required: true },
  instructions: { type: String, default: null }
});

const prescriptionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  visit_id: { type: Number, required: true, ref: 'Visit' },
  patient_id: { type: Number, required: true, ref: 'Patient' },
  doctor_id: { type: Number, required: true, ref: 'User' },
  notes: { type: String, default: null },
  items: [prescriptionItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
