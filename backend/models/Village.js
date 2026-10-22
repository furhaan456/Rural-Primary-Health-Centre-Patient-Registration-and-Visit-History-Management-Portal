const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  district: { type: String, default: 'Sundargarh' },
  state: { type: String, default: 'Odisha' }
}, { timestamps: true });

module.exports = mongoose.model('Village', villageSchema);
