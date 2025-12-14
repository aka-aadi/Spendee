const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const UPIPayment = require('../models/UPIPayment');

// Get all UPI payments
router.get('/', authenticate, async (req, res) => {
  try {
    // All users see only their own UPI payments
    const query = { userId: req.user._id };
    
    console.log(`[UPI GET] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let upiQuery = UPIPayment.find(query)
      .lean() // Use lean() for read-only queries - much faster
      .sort({ date: -1 });
    
    if (limit) {
      upiQuery = upiQuery.limit(limit);
    }
    
    const upiPayments = await upiQuery;
    console.log(`[UPI GET] Found ${upiPayments.length} UPI payments for user ${req.user._id}`);
    res.json(upiPayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching UPI payments', error: error.message });
  }
});

// Get UPI payment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // All users see only their own UPI payments
    const query = { _id: req.params.id, userId: req.user._id };
    const upiPayment = await UPIPayment.findOne(query);
    if (!upiPayment) {
      return res.status(404).json({ message: 'UPI payment not found' });
    }
    res.json(upiPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching UPI payment', error: error.message });
  }
});

// Create UPI payment
router.post('/', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...paymentData } = req.body;
    
    // Generate transaction ID if not provided
    if (!paymentData.transactionId) {
      paymentData.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    // Always use the authenticated user's ID
    const upiPayment = new UPIPayment({
      ...paymentData,
      userId: req.user._id
    });
    
    console.log(`[UPI CREATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}`);
    
    await upiPayment.save();
    res.status(201).json(upiPayment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating UPI payment', error: error.message });
  }
});

// Update UPI payment
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Explicitly remove userId from body to prevent client manipulation
    const { userId, ...updateData } = req.body;
    
    // All users can only update their own UPI payments
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[UPI UPDATE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const upiPayment = await UPIPayment.findOneAndUpdate(
      query,
      updateData, // Use sanitized data without userId
      { new: true, runValidators: true }
    );
    if (!upiPayment) {
      return res.status(404).json({ message: 'UPI payment not found' });
    }
    res.json(upiPayment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating UPI payment', error: error.message });
  }
});

// Delete UPI payment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // All users can only delete their own UPI payments
    const query = { _id: req.params.id, userId: req.user._id };
    
    console.log(`[UPI DELETE] User: ${req.user._id} (${req.user.username}), Role: ${req.user.role}, Query:`, JSON.stringify(query));
    
    const upiPayment = await UPIPayment.findOneAndDelete(query);
    if (!upiPayment) {
      return res.status(404).json({ message: 'UPI payment not found' });
    }
    console.log(`[UPI DELETE] Deleted UPI payment ${req.params.id} with userId: ${upiPayment.userId}`);
    res.json({ message: 'UPI payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting UPI payment', error: error.message });
  }
});

// Get UPI payments summary
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // All users see only their own UPI payments
    const query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Use aggregation for faster calculation
    const [upiPayments, appTotals, categoryTotals, totalResult] = await Promise.all([
      UPIPayment.find(query).lean(),
      UPIPayment.aggregate([
        { $match: query },
        { $group: { _id: '$upiApp', total: { $sum: '$amount' } } }
      ]),
      UPIPayment.aggregate([
        { $match: query },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      UPIPayment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    const byApp = appTotals.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});
    const byCategory = categoryTotals.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    res.json({
      total,
      count: upiPayments.length,
      byApp,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;


