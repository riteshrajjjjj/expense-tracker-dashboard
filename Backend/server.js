const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ATLASDB_URL = process.env.ATLASDB_URL || 'mongodb://localhost:27017/wealthflow';

app.use(cors());
app.use(express.json());

mongoose
  .connect(ATLASDB_URL)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Updated Transaction Schema to allow 'TRANSFER' type
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE', 'TRANSFER'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  current: { type: Number, default: 0 },
  target: { type: Number, required: true },
  color: { type: String, default: '#3b82f6' }
});
const Goal = mongoose.model('Goal', goalSchema);

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, default: 100 }
});
const Budget = mongoose.model('Budget', budgetSchema);

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Routes
app.get('/api/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { title, amount, type, category, userId } = req.body;
    const transaction = await Transaction.create({ userId, title, amount: Number(amount), type, category });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });
    const goals = await Goal.find({ userId });
    res.status(200).json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { userId, name, target, color, current } = req.body;
    const goal = await Goal.create({ userId, name, target, color, current: current || 0 });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/budgets', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });
    const budgets = await Budget.find({ userId });
    res.status(200).json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { userId, category, limit } = req.body;
    const budget = await Budget.findOneAndUpdate({ userId, category }, { limit }, { new: true, upsert: true });
    res.status(200).json({ success: true, data: budget });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ success: true, data: [] });
    const subs = await Subscription.find({ userId });
    res.status(200).json({ success: true, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { userId, title, amount, dueDate, status } = req.body;
    const sub = await Subscription.create({ userId, title, amount, dueDate, status });
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 WealthFlow Server running on http://localhost:${PORT}`));