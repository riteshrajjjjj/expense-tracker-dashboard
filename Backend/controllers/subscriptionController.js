const Subscription = require('../models/Subscription');

exports.getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const subs = await Subscription.find(filter);
    res.status(200).json({ success: true, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { userId, title, amount, dueDate, status } = req.body;
    const sub = await Subscription.create({ userId, title, amount: Number(amount), dueDate, status: status || 'Pending' });
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.togglePayStatus = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = sub.status === 'Pending' ? 'Paid' : 'Pending';
    await sub.save();
    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const updatedSub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedSub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, data: updatedSub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const deletedSub = await Subscription.findByIdAndDelete(req.params.id);
    if (!deletedSub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};