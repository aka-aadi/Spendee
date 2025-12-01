import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import './Income.css';

const Income = () => {
  const [allIncome, setAllIncome] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Salary'
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const filterIncome = useCallback(() => {
    let filtered = [...allIncome];
    
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter(incomeItem => {
        const incomeDate = new Date(incomeItem.date);
        return incomeDate.getMonth() === parseInt(selectedMonth) && 
               incomeDate.getFullYear() === parseInt(selectedYear);
      });
    }
    
    setIncome(filtered);
  }, [allIncome, selectedMonth, selectedYear]);

  useEffect(() => {
    filterIncome();
  }, [filterIncome]);

  const fetchIncome = async () => {
    try {
      const response = await axios.get('/income');
      setAllIncome(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching income:', error);
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
      if (editingIncome) {
        await axios.put(`/income/${editingIncome._id}`, formData);
      } else {
        await axios.post('/income', formData);
      }
      setShowModal(false);
      resetForm();
      fetchIncome();
    } catch (error) {
      alert('Error saving income: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await axios.delete(`/income/${id}`);
        fetchIncome();
      } catch (error) {
        alert('Error deleting income: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (incomeItem) => {
    setEditingIncome(incomeItem);
    setFormData({
      amount: incomeItem.amount,
      source: incomeItem.source,
      description: incomeItem.description || '',
      date: format(new Date(incomeItem.date), 'yyyy-MM-dd'),
      type: incomeItem.type || 'Salary'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'Salary'
    });
    setEditingIncome(null);
  };

  const incomeTypes = ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];

  if (loading) {
    return <div className="loading">Loading income...</div>;
  }

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="income-page"
    >
      <div className="page-header">
        <h1 className="page-title">Income</h1>
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
            <FiPlus /> Add Income
          </motion.button>
        </div>
      </div>

      <div className="summary-card">
        <h3>Total Income</h3>
        <p className="summary-amount">₹{totalIncome.toLocaleString()}</p>
      </div>

      <div className="income-list">
        <AnimatePresence>
          {income.length === 0 ? (
            <div className="empty-state">No income recorded yet. Add your first income!</div>
          ) : (
            income.map((incomeItem) => (
              <motion.div
                key={incomeItem._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="income-card"
              >
                <div className="income-info">
                  <div className="income-header">
                    <h3>{incomeItem.source}</h3>
                    <span className="income-amount">₹{incomeItem.amount.toLocaleString()}</span>
                  </div>
                  {incomeItem.description && (
                    <p className="income-description">{incomeItem.description}</p>
                  )}
                  <div className="income-meta">
                    <span>{incomeItem.type}</span>
                    <span className="divider">•</span>
                    <span>{format(new Date(incomeItem.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <div className="income-actions">
                  <button onClick={() => handleEdit(incomeItem)} className="edit-button">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(incomeItem._id)} className="delete-button">
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
                <h2>{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
                <button onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} className="close-button">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="income-form">
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
                  <label>Source *</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                    placeholder="e.g., Salary from Company"
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {incomeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                    {editingIncome ? 'Update' : 'Add'} Income
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

export default Income;


