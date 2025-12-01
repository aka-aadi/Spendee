import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSmartphone } from 'react-icons/fi';
import './UPIPayments.css';

const UPIPayments = () => {
  const [allUPIPayments, setAllUPIPayments] = useState([]);
  const [upiPayments, setUpiPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    upiApp: 'Google Pay',
    recipientName: '',
    recipientUPI: '',
    category: 'Food',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Success',
    transactionId: ''
  });

  useEffect(() => {
    fetchUPIPayments();
  }, []);

  useEffect(() => {
    filterUPIPayments();
  }, [allUPIPayments, selectedMonth, selectedYear]);

  const fetchUPIPayments = async () => {
    try {
      const response = await axios.get('/upi');
      setAllUPIPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching UPI payments:', error);
      setLoading(false);
    }
  };

  const filterUPIPayments = () => {
    let filtered = [...allUPIPayments];
    
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === parseInt(selectedMonth) && 
               paymentDate.getFullYear() === parseInt(selectedYear);
      });
    }
    
    setUpiPayments(filtered);
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
      if (editingPayment) {
        await axios.put(`/upi/${editingPayment._id}`, formData);
      } else {
        await axios.post('/upi', formData);
      }
      setShowModal(false);
      resetForm();
      fetchUPIPayments();
    } catch (error) {
      alert('Error saving UPI payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this UPI payment?')) {
      try {
        await axios.delete(`/upi/${id}`);
        fetchUPIPayments();
      } catch (error) {
        alert('Error deleting UPI payment: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount,
      upiApp: payment.upiApp,
      recipientName: payment.recipientName || '',
      recipientUPI: payment.recipientUPI || '',
      category: payment.category,
      description: payment.description || '',
      date: format(new Date(payment.date), 'yyyy-MM-dd'),
      status: payment.status,
      transactionId: payment.transactionId
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      upiApp: 'Google Pay',
      recipientName: '',
      recipientUPI: '',
      category: 'Food',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Success',
      transactionId: ''
    });
    setEditingPayment(null);
  };

  const upiApps = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'Other'];
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const statuses = ['Success', 'Pending', 'Failed'];

  if (loading) {
    return <div className="loading">Loading UPI payments...</div>;
  }

  const totalUPI = upiPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="upi-page"
    >
      <div className="page-header">
        <h1 className="page-title">UPI Payments</h1>
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
            <FiPlus /> Add UPI Payment
          </motion.button>
        </div>
      </div>

      <div className="summary-card">
        <h3>Total UPI Payments</h3>
        <p className="summary-amount">₹{totalUPI.toLocaleString()}</p>
      </div>

      <div className="upi-list">
        <AnimatePresence>
          {upiPayments.length === 0 ? (
            <div className="empty-state">No UPI payments recorded yet. Add your first payment!</div>
          ) : (
            upiPayments.map((payment) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="upi-card"
              >
                <div className="upi-header">
                  <div className="upi-icon">
                    <FiSmartphone />
                  </div>
                  <div className="upi-info">
                    <h3>{payment.upiApp}</h3>
                    <p className="upi-category">{payment.category}</p>
                  </div>
                  <div className="upi-amount">
                    <span>₹{payment.amount.toLocaleString()}</span>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>

                <div className="upi-details">
                  {payment.recipientName && (
                    <div className="detail-row">
                      <span className="detail-label">Recipient:</span>
                      <span className="detail-value">{payment.recipientName}</span>
                    </div>
                  )}
                  {payment.recipientUPI && (
                    <div className="detail-row">
                      <span className="detail-label">UPI ID:</span>
                      <span className="detail-value">{payment.recipientUPI}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value transaction-id">{payment.transactionId}</span>
                  </div>
                  {payment.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{payment.description}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{format(new Date(payment.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="upi-actions">
                  <button onClick={() => handleEdit(payment)} className="edit-button">
                    <FiEdit2 /> Edit
                  </button>
                  <button onClick={() => handleDelete(payment._id)} className="delete-button">
                    <FiTrash2 /> Delete
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
                <h2>{editingPayment ? 'Edit UPI Payment' : 'Add UPI Payment'}</h2>
                <button onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} className="close-button">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="upi-form">
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
                  <label>UPI App *</label>
                  <select
                    value={formData.upiApp}
                    onChange={(e) => setFormData({ ...formData, upiApp: e.target.value })}
                    required
                  >
                    {upiApps.map(app => (
                      <option key={app} value={app}>{app}</option>
                    ))}
                  </select>
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
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Leave empty for auto-generation"
                  />
                </div>

                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="Recipient name"
                  />
                </div>

                <div className="form-group">
                  <label>Recipient UPI ID</label>
                  <input
                    type="text"
                    value={formData.recipientUPI}
                    onChange={(e) => setFormData({ ...formData, recipientUPI: e.target.value })}
                    placeholder="e.g., name@upi"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
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
                    {editingPayment ? 'Update' : 'Add'} Payment
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

export default UPIPayments;


