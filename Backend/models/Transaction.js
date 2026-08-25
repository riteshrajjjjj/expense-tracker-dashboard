const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a transaction title'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative amount'],
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE', 'TRANSFER'],
    required: [true, 'Type must be INCOME, EXPENSE, or TRANSFER'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);