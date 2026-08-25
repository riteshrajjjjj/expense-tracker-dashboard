const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const goals = await Goal.find(filter);
    res.status(200).json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { userId, name, target, color, current } = req.body;
    const goal = await Goal.create({ userId, name, target, color: color || '#3b82f6', current: current || 0 });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedGoal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: updatedGoal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);
    if (!deletedGoal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};