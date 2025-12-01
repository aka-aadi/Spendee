const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const EMI = require('../models/EMI');
const UPIPayment = require('../models/UPIPayment');
const Saving = require('../models/Saving');

// Get comprehensive financial summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Admin users can see all data, regular users see only their own
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { date: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    // Fetch all data in parallel with optimized queries
    // Use .lean() for read-only queries (faster, returns plain objects)
    // For available balance calculation, we need ALL data (cumulative), not just date range
    // But for monthly breakdown, we use date range
    const [allExpenses, allIncome, allUPIPayments, allSavings, expenses, income, budgets, emis, upiPayments, savings] = await Promise.all([
      // Fetch ALL data for cumulative balance calculation
      Expense.find(query).lean().sort({ date: -1 }).catch(err => {
        console.error('Error fetching all expenses:', err);
        return [];
      }),
      Income.find(query).lean().sort({ date: -1 }).catch(err => {
        console.error('Error fetching all income:', err);
        return [];
      }),
      UPIPayment.find(query).lean().sort({ date: -1 }).catch(err => {
        console.error('Error fetching all UPI payments:', err);
        return [];
      }),
      Saving.find(query).lean().sort({ date: -1 }).catch(err => {
        console.error('Error fetching all savings:', err);
        return [];
      }),
      // Fetch date-filtered data for monthly breakdown
      Expense.find({ ...query, ...dateQuery })
        .lean()
        .sort({ date: -1 })
        .catch(err => {
          console.error('Error fetching expenses:', err);
          return [];
        }),
      Income.find({ ...query, ...dateQuery })
        .lean()
        .sort({ date: -1 })
        .catch(err => {
          console.error('Error fetching income:', err);
          return [];
        }),
      Budget.find({ ...query, isActive: true })
        .lean()
        .sort({ createdAt: -1 })
        .catch(err => {
          console.error('Error fetching budgets:', err);
          return [];
        }),
      EMI.find({ ...query, isActive: true })
        .lean()
        .sort({ nextDueDate: 1 })
        .catch(err => {
          console.error('Error fetching EMIs:', err);
          return [];
        }),
      UPIPayment.find({ ...query, ...dateQuery })
        .lean()
        .sort({ date: -1 })
        .catch(err => {
          console.error('Error fetching UPI payments:', err);
          return [];
        }),
      Saving.find({ ...query, ...dateQuery })
        .lean()
        .sort({ date: -1 })
        .catch(err => {
          console.error('Error fetching savings:', err);
          return [];
        })
    ]);


    // Ensure all arrays are valid (handle null/undefined)
    const safeIncome = Array.isArray(income) ? income : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeUPIPayments = Array.isArray(upiPayments) ? upiPayments : [];
    const safeSavings = Array.isArray(savings) ? savings : [];
    const safeAllIncome = Array.isArray(allIncome) ? allIncome : [];
    const safeAllExpenses = Array.isArray(allExpenses) ? allExpenses : [];
    const safeAllUPIPayments = Array.isArray(allUPIPayments) ? allUPIPayments : [];
    const safeAllSavings = Array.isArray(allSavings) ? allSavings : [];
    const safeEMIs = Array.isArray(emis) ? emis : [];
    const safeBudgets = Array.isArray(budgets) ? budgets : [];

    // Calculate totals for date range (for monthly breakdown)
    const totalIncome = safeIncome.reduce((sum, inc) => sum + (inc?.amount || 0), 0);
    const totalExpenses = safeExpenses.reduce((sum, exp) => sum + (exp?.amount || 0), 0);
    // Only count successful UPI payments
    const totalUPI = safeUPIPayments
      .filter(upi => upi?.status === 'Success')
      .reduce((sum, upi) => sum + (upi?.amount || 0), 0);
    const totalSavings = safeSavings.reduce((sum, saving) => sum + (saving?.amount || 0), 0);
    
    // Calculate cumulative totals (from all time) for available balance
    const cumulativeIncome = safeAllIncome.reduce((sum, inc) => sum + (inc?.amount || 0), 0);
    const cumulativeExpenses = safeAllExpenses.reduce((sum, exp) => sum + (exp?.amount || 0), 0);
    const cumulativeUPI = safeAllUPIPayments
      .filter(upi => upi?.status === 'Success')
      .reduce((sum, upi) => sum + (upi?.amount || 0), 0);
    const cumulativeSavings = safeAllSavings.reduce((sum, saving) => sum + (saving?.amount || 0), 0);
    
    // Calculate EMIs - only count EMIs that are marked as paid
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalEMI = 0;
    let totalDownPayments = 0;
    
    safeEMIs.forEach(emi => {
      if (!emi || !emi.startDate) return;
      try {
        const emiStartDate = new Date(emi.startDate);
        if (isNaN(emiStartDate.getTime())) return;
        
        const paidMonthDates = Array.isArray(emi.paidMonthDates) ? emi.paidMonthDates : [];
        
        // EMI starts from next month after start date
        // Count down payment if start date is today or in the past AND if it should be included
        const shouldIncludeDownPayment = emi.includeDownPaymentInBalance !== undefined 
          ? emi.includeDownPaymentInBalance 
          : true; // Default to true for backward compatibility
        
        if (emiStartDate <= now && shouldIncludeDownPayment) {
          totalDownPayments += (emi.downPayment || 0);
        }
        
        // Only count EMI amounts for months that are marked as paid
        // Count each paid month's EMI
        const monthlyEMI = emi.monthlyEMI || 0;
        totalEMI += (paidMonthDates.length * monthlyEMI);
      } catch (err) {
        console.error('Error processing EMI:', emi?._id, err);
      }
    });
    
    const totalBudget = safeBudgets.reduce((sum, budget) => {
      if (!budget || !budget.startDate || !budget.endDate) return sum;
      try {
        const budgetExpenses = safeExpenses.filter(exp => {
          if (!exp || !exp.date) return false;
          return exp.category === budget.category &&
                 new Date(exp.date) >= new Date(budget.startDate) &&
                 new Date(exp.date) <= new Date(budget.endDate);
        });
        const spent = budgetExpenses.reduce((s, e) => s + (e?.amount || 0), 0);
        return sum + Math.max(0, (budget.amount || 0) - spent);
      } catch (err) {
        console.error('Error processing budget:', budget?._id, err);
        return sum;
      }
    }, 0);

    // Calculate total expenses (expenses + down payments + EMIs + UPI payments + savings)
    const totalAllExpenses = totalExpenses + totalEMI + totalDownPayments + totalUPI + totalSavings;
    
    // Calculate cumulative available balance (from all time, not just current month)
    // This ensures balance carries over from previous months
    const availableBalance = cumulativeIncome - cumulativeExpenses - totalEMI - totalDownPayments - cumulativeUPI - cumulativeSavings;

    // Use aggregation for faster category calculations
    const [expenseCategoryTotals, upiCategoryTotals, incomeTypeTotals] = await Promise.all([
      Expense.aggregate([
        { $match: { ...query, ...dateQuery } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      UPIPayment.aggregate([
        { $match: { ...query, ...dateQuery, status: 'Success' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { ...query, ...dateQuery } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);

    // Build expenses by category
    const expensesByCategory = {};
    expenseCategoryTotals.forEach(item => {
      expensesByCategory[item._id] = item.total;
    });
    
    // Add UPI payments by category (merge with expenses)
    upiCategoryTotals.forEach(item => {
      expensesByCategory[item._id] = (expensesByCategory[item._id] || 0) + item.total;
    });
    
    // Add EMI to expenses by category
    if (totalEMI > 0) {
      expensesByCategory['EMI'] = (expensesByCategory['EMI'] || 0) + totalEMI;
    }
    
    // Add Down Payments as a separate category if they exist
    if (totalDownPayments > 0) {
      expensesByCategory['Down Payments'] = (expensesByCategory['Down Payments'] || 0) + totalDownPayments;
    }

    // Add Savings as a separate category (shown in blue in UI)
    if (totalSavings > 0) {
      expensesByCategory['Savings'] = (expensesByCategory['Savings'] || 0) + totalSavings;
    }

    // Build income by type
    const incomeByType = {};
    incomeTypeTotals.forEach(item => {
      incomeByType[item._id] = item.total;
    });

    res.json({
      income: {
        total: totalIncome,
        count: safeIncome.length,
        byType: incomeByType,
        items: safeIncome
      },
      expenses: {
        total: totalExpenses,
        totalAll: totalAllExpenses, // Total including expenses, EMIs, down payments, and UPI
        count: safeExpenses.length,
        byCategory: expensesByCategory,
        items: safeExpenses
      },
      emis: {
        totalMonthly: totalEMI,
        totalDownPayments,
        count: safeEMIs.length,
        items: safeEMIs
      },
      budgets: {
        total: safeBudgets.reduce((sum, b) => sum + (b?.amount || 0), 0),
        count: safeBudgets.length,
        items: safeBudgets
      },
      savings: {
        total: totalSavings,
        count: safeSavings.length,
        items: safeSavings
      },
      balance: {
        available: availableBalance,
        availableBalance: availableBalance,
        totalIncome,
        totalExpenses,
        totalEMI,
        totalDownPayments,
        totalUPI,
        totalSavings,
        totalAllExpenses, // Total expenses including all components
        remainingAfterExpenses: totalIncome - totalExpenses - totalEMI, // Net savings after EMIs
        remainingAfterAll: availableBalance
      }
    });
  } catch (error) {
    console.error('Error in financial summary:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching financial summary', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
