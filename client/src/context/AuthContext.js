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

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // Enable cookies for session management

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid - clear auth state
      // This will be handled by the component using the context
      console.log('Session expired or invalid');
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is authenticated by calling /auth/me
        const response = await axios.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // Not authenticated or session expired
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
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
    
    const handleInactivity = async () => {
      // Show warning before logout
      const shouldStay = window.confirm(
        'You have been inactive for 30 minutes. Do you want to stay logged in?\n\nClick OK to continue, or Cancel to logout.'
      );
      
      if (!shouldStay) {
        // User chose to logout
        try {
          await axios.post('/auth/logout').catch(console.error);
        } catch (error) {
          console.error('Logout error:', error);
        }
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
      
      if (response.data && response.data.success && response.data.user) {
        // Session is stored in HTTP-only cookie, no need to store anything client-side
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Login failed. Invalid response from server.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to destroy session on server
      await axios.post('/auth/logout').catch(console.error);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
    }
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
