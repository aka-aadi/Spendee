const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    // All users see only their own expenses
    const query = { userId: req.user._id };
    
    console.log(`[EXPENSE GET] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let expensesQuery = Expense.find(query)
      .lean() // Use lean() for read-only queries - much faster
      .sort({ date: -1 });
    
    if (limit) {
      expensesQuery = expensesQuery.limit(limit);
    }
    
    const expenses = await expensesQuery;
    console.log(`[EXPENSE GET] Found ${expenses.length} expenses for user ${req.user._id}`);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});

// Get expense by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // All users see only their own expenses
    const query = { _id: req.params.id, userId: req.user._id };
    const expense = await Expense.findOne(query);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
});

// Create expense
router.post('/', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...expenseData } = req.body;
    
    // Always use the authenticated user's ID
    const expense = new Expense({
      ...expenseData,
      userId: req.user._id
    });
    
    console.log(`[EXPENSE CREATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}`);
    
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating expense', error: error.message });
  }
});

// Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...updateData } = req.body;
    
    // All users can only update their own expenses
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[EXPENSE UPDATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const expense = await Expense.findOneAndUpdate(
      query,
      updateData, // Use sanitized data without userId
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error updating expense', error: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // All users can only delete their own expenses
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[EXPENSE DELETE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const expense = await Expense.findOneAndDelete(query);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    console.log(`[EXPENSE DELETE] Deleted expense ${req.params.id} with userId: ${expense.userId}`);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
});

// Get expenses summary
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // All users see only their own expenses
    const query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Use aggregation for faster calculation
    const [expenses, categoryTotals] = await Promise.all([
      Expense.find(query).lean(),
      Expense.aggregate([
        { $match: query },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = categoryTotals.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    res.json({
      total,
      count: expenses.length,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;


