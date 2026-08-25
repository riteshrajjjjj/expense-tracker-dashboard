const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const budgets = await Budget.find(filter);
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.upsertBudget = async (req, res) => {
  try {
    const { userId, category, limit } = req.body;
    if (!userId || !category) return res.status(400).json({ success: false, error: 'User ID and Category are required' });

    const budget = await Budget.findOneAndUpdate(
      { userId, category },
      { limit: Number(limit) },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ success: false, error: 'Budget not found' });
    res.status(200).json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};