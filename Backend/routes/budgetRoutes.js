const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// GET budgets
router.get('/', async (req, res) => {
  const budgets = await Budget.find();
  res.json({ success: true, data: budgets });
});

// POST or update budget limit
router.post('/', async (req, res) => {
  const { category, limit } = req.body;
  const budget = await Budget.findOneAndUpdate({ category }, { limit }, { upsert: true, new: true });
  res.json({ success: true, data: budget });
});

module.exports = router;