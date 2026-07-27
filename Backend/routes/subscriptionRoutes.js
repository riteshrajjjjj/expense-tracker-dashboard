const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// GET all bills
router.get('/', async (req, res) => {
  const subs = await Subscription.find();
  res.json({ success: true, data: subs });
});

// PATCH toggle bill status (Mark as Paid Button)
router.patch('/:id/pay', async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (sub) {
    sub.status = sub.status === 'Pending' ? 'Paid' : 'Pending';
    await sub.save();
  }
  res.json({ success: true, data: sub });
});

module.exports = router;