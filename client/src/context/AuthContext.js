import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { setupInactivityTimer } from '../utils/inactivityTimer';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Production API URL - can be overridden with REACT_APP_API_URL environment variable
const API_URL = process.env.REACT_APP_API_URL || 'https://spendee-qkf8.onrender.com/api';

axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token is still valid by making a test request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Validate token by making a request that requires authentication
          // Try to get expenses list - if token is valid, this will succeed
          await axios.get('/expenses', { params: { limit: 0 } });
          // Token is valid
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  // Setup inactivity timer (30 minutes)
  useEffect(() => {
    if (!isAuthenticated) {
      // Cleanup if not authenticated
      if (cleanupTimerRef.current) {
        cleanupTimerRef.current();
        cleanupTimerRef.current = null;
      }
      return;
    }
    
    const handleInactivity = () => {
      // Show warning before logout
      const shouldStay = window.confirm(
        'You have been inactive for 30 minutes. Do you want to stay logged in?\n\nClick OK to continue, or Cancel to logout.'
      );
      
      if (!shouldStay) {
        // User chose to logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        if (cleanupTimerRef.current) {
          cleanupTimerRef.current();
          cleanupTimerRef.current = null;
        }
      } else {
        // User chose to stay - reset the timer
        if (cleanupTimerRef.current) {
          cleanupTimerRef.current();
        }
        cleanupTimerRef.current = setupInactivityTimer(handleInactivity, 30);
      }
    };

    // Cleanup any existing timer
    if (cleanupTimerRef.current) {
      cleanupTimerRef.current();
    }

    // Setup new timer
    cleanupTimerRef.current = setupInactivityTimer(handleInactivity, 30);

    return () => {
      if (cleanupTimerRef.current) {
        cleanupTimerRef.current();
        cleanupTimerRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
