const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Income = require('../models/Income');

// Get all income
router.get('/', authenticate, async (req, res) => {
  try {
    // All users see only their own income
    const query = { userId: req.user._id };
    
    console.log(`[INCOME GET] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let incomeQuery = Income.find(query)
      .lean() // Use lean() for read-only queries - much faster
      .sort({ date: -1 });
    
    if (limit) {
      incomeQuery = incomeQuery.limit(limit);
    }
    
    const income = await incomeQuery;
    console.log(`[INCOME GET] Found ${income.length} income records for user ${req.user._id}`);
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income', error: error.message });
  }
});

// Get income by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // All users see only their own income
    const query = { _id: req.params.id, userId: req.user._id };
    const income = await Income.findOne(query);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income', error: error.message });
  }
});

// Create income
router.post('/', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...incomeData } = req.body;
    
    // Always use the authenticated user's ID
    const income = new Income({
      ...incomeData,
      userId: req.user._id
    });
    
    console.log(`[INCOME CREATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}`);
    
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: 'Error creating income', error: error.message });
  }
});

// Update income
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...updateData } = req.body;
    
    // All users can only update their own income
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[INCOME UPDATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const income = await Income.findOneAndUpdate(
      query,
      updateData, // Use sanitized data without userId
      { new: true, runValidators: true }
    );
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(400).json({ message: 'Error updating income', error: error.message });
  }
});

// Delete income
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // All users can only delete their own income
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[INCOME DELETE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const income = await Income.findOneAndDelete(query);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    console.log(`[INCOME DELETE] Deleted income ${req.params.id} with userId: ${income.userId}`);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting income', error: error.message });
  }
});

// Get income summary
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // All users see only their own income
    const query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Use aggregation for faster calculation
    const [income, typeTotals] = await Promise.all([
      Income.find(query).lean(),
      Income.aggregate([
        { $match: query },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);
    
    const total = income.reduce((sum, inc) => sum + inc.amount, 0);
    const byType = typeTotals.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    res.json({
      total,
      count: income.length,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;


