const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const UPIPayment = require('../models/UPIPayment');

// Get all budgets
router.get('/', authenticate, async (req, res) => {
  try {
    const budgets = await Budget.find({ isActive: true })
      .lean()
      .sort({ createdAt: -1 });
    
    if (budgets.length === 0) {
      return res.json([]);
    }
    
    // Use aggregation for MUCH faster calculation
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const [expenseResult, upiResult] = await Promise.all([
          Expense.aggregate([
            {
              $match: {
                category: budget.category,
                date: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),
          UPIPayment.aggregate([
            {
              $match: {
                category: budget.category,
                status: 'Success',
                date: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        ]);
        
        const expenseTotal = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const upiTotal = upiResult.length > 0 ? upiResult[0].total : 0;
        const spent = expenseTotal + upiTotal;
        
        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          percentageUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        };
      })
    );
    
    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
});

// Get budget by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    const expenseQuery = { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate } };
    const upiQuery = { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate }, status: 'Success' };
    
    const [expenseResult, upiResult] = await Promise.all([
      Expense.aggregate([
        { $match: expenseQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      UPIPayment.aggregate([
        { $match: upiQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    const expenseTotal = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const upiTotal = upiResult.length > 0 ? upiResult[0].total : 0;
    const spent = expenseTotal + upiTotal;
    
    res.json({
      ...budget.toObject(),
      spent,
      remaining: budget.amount - spent,
      percentageUsed: (spent / budget.amount) * 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget', error: error.message });
  }
});

// Create budget
router.post('/', authenticate, async (req, res) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: 'Error creating budget', error: error.message });
  }
});

// Update budget
router.put('/:id', authenticate, async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: 'Error updating budget', error: error.message });
  }
});

// Delete budget
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget', error: error.message });
  }
});

module.exports = router;
