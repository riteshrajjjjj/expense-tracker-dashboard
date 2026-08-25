const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  current: { type: Number, default: 0 },
  target: { type: Number, required: true },
  color: { type: String, default: '#3b82f6' }
});

module.exports = mongoose.model('Goal', goalSchema);