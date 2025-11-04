const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const UPIPayment = require('../models/UPIPayment');

// Get all budgets
router.get('/', authenticate, async (req, res) => {
  try {
    // Admin users can see all budgets, regular users see only their own
    const budgetQuery = req.user.role === 'admin' 
      ? { isActive: true }
      : { userId: req.user._id, isActive: true };
    const budgets = await Budget.find(budgetQuery).sort({ createdAt: -1 });
    
    // Calculate spent amount for each budget (including expenses and UPI payments)
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      // For admin, get all expenses; for regular users, only their own
      const expenseQuery = req.user.role === 'admin'
        ? { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate } }
        : { userId: req.user._id, category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate } };
      const expenses = await Expense.find(expenseQuery);
      
      // For admin, get all UPI payments; for regular users, only their own
      const upiQuery = req.user.role === 'admin'
        ? { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate }, status: 'Success' }
        : { userId: req.user._id, category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate }, status: 'Success' };
      const upiPayments = await UPIPayment.find(upiQuery);
      
      // Calculate total spent from both expenses and UPI payments
      const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const upiTotal = upiPayments.reduce((sum, upi) => sum + upi.amount, 0);
      const spent = expenseTotal + upiTotal;
      
      return {
        ...budget.toObject(),
        spent,
        remaining: budget.amount - spent,
        percentageUsed: (spent / budget.amount) * 100
      };
    }));
    
    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
});

// Get budget by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Admin users can see any budget, regular users see only their own
    const budgetQuery = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id };
    const budget = await Budget.findOne(budgetQuery);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // For admin, get all expenses; for regular users, only their own
    const expenseQuery = req.user.role === 'admin'
      ? { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate } }
      : { userId: req.user._id, category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate } };
    const expenses = await Expense.find(expenseQuery);
    
    // For admin, get all UPI payments; for regular users, only their own
    const upiQuery = req.user.role === 'admin'
      ? { category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate }, status: 'Success' }
      : { userId: req.user._id, category: budget.category, date: { $gte: budget.startDate, $lte: budget.endDate }, status: 'Success' };
    const upiPayments = await UPIPayment.find(upiQuery);
    
    // Calculate total spent from both expenses and UPI payments
    const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const upiTotal = upiPayments.reduce((sum, upi) => sum + upi.amount, 0);
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
    const budget = new Budget({
      ...req.body,
      userId: req.user._id
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: 'Error creating budget', error: error.message });
  }
});

// Update budget
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Admin users can update any budget, regular users can only update their own
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id };
    const budget = await Budget.findOneAndUpdate(
      query,
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
    // Admin users can delete any budget, regular users can only delete their own
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id };
    const budget = await Budget.findOneAndDelete(query);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget', error: error.message });
  }
});

module.exports = router;
