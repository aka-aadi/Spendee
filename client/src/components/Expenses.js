import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import './Expenses.css';

const Expenses = () => {
  const [allExpenses, setAllExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filterExpenses = useCallback(() => {
    let filtered = [...allExpenses];
    
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === parseInt(selectedMonth) && 
               expenseDate.getFullYear() === parseInt(selectedYear);
      });
    }
    
    setExpenses(filtered);
  }, [allExpenses, selectedMonth, selectedYear]);

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/expenses');
      setAllExpenses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
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
      if (editingExpense) {
        await axios.put(`/expenses/${editingExpense._id}`, formData);
      } else {
        await axios.post('/expenses', formData);
      }
      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      alert('Error saving expense: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        alert('Error deleting expense: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      paymentMethod: expense.paymentMethod || 'Cash'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Food',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Cash'
    });
    setEditingExpense(null);
  };

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'];

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="expenses-page"
    >
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
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
            <FiPlus /> Add Expense
          </motion.button>
        </div>
      </div>

      <div className="summary-card">
        <h3>Total Expenses</h3>
        <p className="summary-amount">₹{totalExpenses.toLocaleString()}</p>
      </div>

      <div className="expenses-list">
        <AnimatePresence>
          {expenses.length === 0 ? (
            <div className="empty-state">No expenses recorded yet. Add your first expense!</div>
          ) : (
            expenses.map((expense) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="expense-card"
              >
                <div className="expense-info">
                  <div className="expense-header">
                    <h3>{expense.category}</h3>
                    <span className="expense-amount">₹{expense.amount.toLocaleString()}</span>
                  </div>
                  {expense.description && (
                    <p className="expense-description">{expense.description}</p>
                  )}
                  <div className="expense-meta">
                    <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    <span className="divider">•</span>
                    <span>{expense.paymentMethod}</span>
                  </div>
                </div>
                <div className="expense-actions">
                  <button onClick={() => handleEdit(expense)} className="edit-button">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(expense._id)} className="delete-button">
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))
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
                <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                <button onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} className="close-button">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="Enter amount"
                  />
                </div>

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
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    {editingExpense ? 'Update' : 'Add'} Expense
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

export default Expenses;


