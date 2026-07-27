const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a transaction title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative amount']
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: [true, 'Type must be either INCOME or EXPENSE']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);