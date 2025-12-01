import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiTarget } from 'react-icons/fi';
import './Budgets.css';

const Budgets = () => {
  const [allBudgets, setAllBudgets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    period: 'Monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    isActive: true
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    filterBudgets();
  }, [allBudgets, selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/budgets');
      setAllBudgets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const filterBudgets = () => {
    let filtered = [...allBudgets];
    
    if (selectedMonth && selectedYear) {
      const selectedDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const selectedDateEnd = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);
      
      filtered = filtered.filter(budget => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        // Check if budget overlaps with selected month
        return startDate <= selectedDateEnd && endDate >= selectedDate;
      });
    }
    
    setBudgets(filtered);
  };

  const getMonthYearOptions = () => {
    const now = new Date();
    const months = [
      { value: '', label: 'All Months' },
      { value: '0', label: 'January' },
      { value: '1', label: 'February' },
      { value: '2', label: 'March' },
      { value: '3', label: 'April' },
      { value: '4', label: 'May' },
      { value: '5', label: 'June' },
      { value: '6', label: 'July' },
      { value: '7', label: 'August' },
      { value: '8', label: 'September' },
      { value: '9', label: 'October' },
      { value: '10', label: 'November' },
      { value: '11', label: 'December' }
    ];
    
    const years = [];
    const currentYear = now.getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    years.unshift({ value: '', label: 'All Years' });
    
    return { months, years };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate end date based on period
      const start = new Date(formData.startDate);
      let endDate;
      if (formData.period === 'Weekly') {
        endDate = addWeeks(start, 1);
      } else if (formData.period === 'Monthly') {
        endDate = addMonths(start, 1);
      } else {
        endDate = addYears(start, 1);
      }

      const submitData = {
        ...formData,
        endDate: format(endDate, 'yyyy-MM-dd')
      };

      if (editingBudget) {
        await axios.put(`/budgets/${editingBudget._id}`, submitData);
      } else {
        await axios.post('/budgets', submitData);
      }
      setShowModal(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      alert('Error saving budget: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (error) {
        alert('Error deleting budget: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(budget.endDate), 'yyyy-MM-dd'),
      isActive: budget.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    const now = new Date();
    setFormData({
      category: 'Food',
      amount: '',
      period: 'Monthly',
      startDate: format(now, 'yyyy-MM-dd'),
      endDate: format(addMonths(now, 1), 'yyyy-MM-dd'),
      isActive: true
    });
    setEditingBudget(null);
  };

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other', 'Overall'];
  const periods = ['Weekly', 'Monthly', 'Yearly'];

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="budgets-page"
    >
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          >
            {getMonthYearOptions().months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          >
            {getMonthYearOptions().years.map(year => (
              <option key={year.value} value={year.value}>{year.label}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="add-button"
          >
            <FiPlus /> Add Budget
          </motion.button>
        </div>
      </div>

      <div className="budgets-list">
        <AnimatePresence>
          {budgets.length === 0 ? (
            <div className="empty-state">No budgets set yet. Create your first budget!</div>
          ) : (
            budgets.map((budget) => {
              const percentage = budget.percentageUsed || 0;
              const isOverBudget = percentage > 100;
              
              return (
                <motion.div
                  key={budget._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="budget-card"
                >
                  <div className="budget-header">
                    <div className="budget-icon">
                      <FiTarget />
                    </div>
                    <div className="budget-info">
                      <h3>{budget.category}</h3>
                      <p className="budget-period">{budget.period} Budget</p>
                    </div>
                    <div className="budget-amount">
                      <span className="budget-total">₹{budget.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${isOverBudget ? 100 : Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                      />
                    </div>
                    <div className="progress-info">
                      <span>Spent: ₹{budget.spent?.toLocaleString() || 0}</span>
                      <span className={`percentage ${isOverBudget ? 'over-budget' : ''}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="budget-remaining">
                      {budget.remaining >= 0 ? (
                        <span className="remaining">Remaining: ₹{budget.remaining.toLocaleString()}</span>
                      ) : (
                        <span className="over-budget">Over by: ₹{Math.abs(budget.remaining).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="budget-actions">
                    <button onClick={() => handleEdit(budget)} className="edit-button">
                      <FiEdit2 /> Edit
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="delete-button">
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingBudget ? 'Edit Budget' : 'Add Budget'}</h2>
                <button onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} className="close-button">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="budget-form">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="Enter budget amount"
                  />
                </div>

                <div className="form-group">
                  <label>Period *</label>
                  <select
                    value={formData.period}
                    onChange={(e) => {
                      const period = e.target.value;
                      const start = new Date(formData.startDate);
                      let endDate;
                      if (period === 'Weekly') {
                        endDate = addWeeks(start, 1);
                      } else if (period === 'Monthly') {
                        endDate = addMonths(start, 1);
                      } else {
                        endDate = addYears(start, 1);
                      }
                      setFormData({
                        ...formData,
                        period,
                        endDate: format(endDate, 'yyyy-MM-dd')
                      });
                    }}
                    required
                  >
                    {periods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      const start = new Date(e.target.value);
                      let endDate;
                      if (formData.period === 'Weekly') {
                        endDate = addWeeks(start, 1);
                      } else if (formData.period === 'Monthly') {
                        endDate = addMonths(start, 1);
                      } else {
                        endDate = addYears(start, 1);
                      }
                      setFormData({
                        ...formData,
                        startDate: e.target.value,
                        endDate: format(endDate, 'yyyy-MM-dd')
                      });
                    }}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    {editingBudget ? 'Update' : 'Create'} Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Budgets;
