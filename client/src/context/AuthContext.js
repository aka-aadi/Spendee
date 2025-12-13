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

// Session ID stored in sessionStorage (persists across page refreshes, cleared when tab closes)
// This is more secure than localStorage as it's cleared when the browser tab closes
const getSessionId = () => {
  try {
    return sessionStorage.getItem('spentee_session_id');
  } catch (e) {
    return null;
  }
};

const setSessionId = (sessionId) => {
  try {
    if (sessionId) {
      sessionStorage.setItem('spentee_session_id', sessionId);
    } else {
      sessionStorage.removeItem('spentee_session_id');
    }
  } catch (e) {
    console.error('Error accessing sessionStorage:', e);
  }
};

let sessionIdRef = getSessionId(); // Initialize from sessionStorage

// Add request interceptor to include session ID in headers
axios.interceptors.request.use(
  (config) => {
    // Get current session ID (may have been updated)
    const currentSessionId = getSessionId();
    // Add session ID to headers if available (works for both web and mobile)
    if (currentSessionId) {
      config.headers['x-session-id'] = currentSessionId;
      sessionIdRef = currentSessionId; // Keep in sync
      console.log('Adding session ID to request:', currentSessionId, 'URL:', config.url);
    } else {
      sessionIdRef = null;
      console.log('No session ID available for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid - clear auth state
      setSessionId(null);
      sessionIdRef = null;
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
      // Check if we have a session ID from sessionStorage
      const storedSessionId = getSessionId();
      
      if (storedSessionId) {
        // We have a session ID, validate it with the server
        try {
          // Set it temporarily for this request
          sessionIdRef = storedSessionId;
          const response = await axios.get('/auth/me');
          
          if (response.data && response.data.user) {
            // Session is valid, restore user state
            setUser(response.data.user);
          setIsAuthenticated(true);
            console.log('Session restored from sessionStorage');
          } else {
            // Session invalid, clear it
            setSessionId(null);
            sessionIdRef = null;
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Session invalid or expired, clear it
          console.log('Session validation failed:', error.response?.status);
          setSessionId(null);
          sessionIdRef = null;
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // No session ID, user needs to login
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
      
      // Initialize admin user
      axios.post('/auth/init').catch(console.error);
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
        // Clear session ID
        setSessionId(null);
        sessionIdRef = null;
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
        // Store session ID in sessionStorage (persists across page refreshes)
        const sessionId = response.data.sessionId;
        setSessionId(sessionId);
        sessionIdRef = sessionId;
        console.log('Session ID stored:', sessionId);
      
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
      if (sessionIdRef) {
        await axios.post('/auth/logout').catch(console.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session ID from sessionStorage and memory
      setSessionId(null);
      sessionIdRef = null;
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
