const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  patient_id: { type: Number, required: true, ref: 'Patient' },
  doctor_id: { type: Number, required: true, ref: 'User' },
  visit_id: { type: Number, required: true, ref: 'Visit' },
  follow_up_date: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);
