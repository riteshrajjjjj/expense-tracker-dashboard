const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// GET all goals
router.get('/', async (req, res) => {
  const goals = await Goal.find();
  res.json({ success: true, data: goals });
});

// POST new goal (+ New Goal Button)
router.post('/', async (req, res) => {
  const goal = await Goal.create(req.body);
  res.status(201).json({ success: true, data: goal });
});

// PUT update goal amount (Deposit / Edit Button)
router.put('/:id', async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: goal });
});

module.exports = router;