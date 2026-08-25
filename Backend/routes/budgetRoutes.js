const express = require('express');
const router = express.Router();
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');

router.get('/', getBudgets);
router.post('/', upsertBudget);
router.delete('/:id', deleteBudget);

module.exports = router;