const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  current: { type: Number, required: true, default: 0 },
  target: { type: Number, required: true },
  color: { type: String, default: '#3b82f6' }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);