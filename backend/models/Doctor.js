const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true, ref: 'User' },
  qualification: { type: String, default: 'MBBS, MD' },
  specialization: { type: String, default: 'General Physician' },
  license_number: { type: String, required: true },
  phone: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
