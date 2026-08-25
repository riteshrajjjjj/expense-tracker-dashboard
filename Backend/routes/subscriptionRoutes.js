const express = require('express');
const router = express.Router();
const { getSubscriptions, createSubscription, togglePayStatus, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.patch('/:id/pay', togglePayStatus);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;