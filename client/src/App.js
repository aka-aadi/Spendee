import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Income from './components/Income';
import Savings from './components/Savings';
import Budgets from './components/Budgets';
import EMIs from './components/EMIs';
import UPIPayments from './components/UPIPayments';
import Transactions from './components/Transactions';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ParticleBackground from './components/ParticleBackground';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: '#ffffff',
        background: '#000000'
      }}>
        Loading...
      </div>
    );
  }
  
  // Only redirect to login if not authenticated and not loading
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="main-layout">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/emis" element={<EMIs />} />
                    <Route path="/upi" element={<UPIPayments />} />
                    <Route path="/transactions" element={<Transactions />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ParticleBackground />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
