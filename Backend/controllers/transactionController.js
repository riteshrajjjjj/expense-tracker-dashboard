const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { userId, title, amount, type, category, date } = req.body;
    const transaction = await Transaction.create({
      userId,
      title,
      amount: Number(amount),
      type,
      category,
      date: date || Date.now()
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedTransaction) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};