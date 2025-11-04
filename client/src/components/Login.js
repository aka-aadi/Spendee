import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoginDoodles from './LoginDoodles';
import Login3DIllustration from './Login3DIllustration';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLookingAtButton, setIsLookingAtButton] = useState(false);
  const [isShakingHead, setIsShakingHead] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize admin user on mount
    axios.post('/auth/init').catch(console.error);
    
    // If already authenticated and not loading, redirect to dashboard
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsLookingAtButton(true);
    setIsShakingHead(false);
    setIsNodding(false);

    const result = await login(username, password);
    
    if (result.success) {
      setIsNodding(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setError(result.message);
      setIsShakingHead(true);
      setTimeout(() => {
        setIsShakingHead(false);
        setIsLookingAtButton(false);
      }, 2000);
    }
    
    setLoading(false);
    setTimeout(() => {
      setIsLookingAtButton(false);
    }, 3000);
  };

  useEffect(() => {
    setIsLookingAway(passwordVisible);
  }, [passwordVisible]);

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="login-card"
      >
        {/* Form Section */}
        <div className="login-form-section">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="login-header"
          >
            <img 
              src="/logo512.png" 
              alt="Spentee Logo" 
              className="login-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="welcome-text">Welcome back!</p>
            <h1>Log In</h1>
          </motion.div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="login@gmail.com"
            />
          </div>

          <div className="form-group">
            <div className="forgot-password-link">
              <a href="#forgot">Forgot Password ?</a>
            </div>
            <div className="password-input-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="login-button"
            animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Logging in...
              </motion.span>
            ) : (
              <motion.span
                whileHover={{ x: [0, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                Login
              </motion.span>
            )}
          </motion.button>
        </form>
        
        {/* Social Login Section */}
        <div className="social-login-section">
          <p className="social-divider">Or log in with</p>
          <div className="social-buttons">
            <button className="social-button" type="button" aria-label="Login with Google">
              <span className="social-icon">G</span>
            </button>
            <button className="social-button" type="button" aria-label="Login with GitHub">
              <span className="social-icon">⚫</span>
            </button>
            <button className="social-button" type="button" aria-label="Login with Facebook">
              <span className="social-icon">f</span>
            </button>
          </div>
          
          <p className="signup-link">
            Don't have an account yet? <a href="#signup" className="signup-link-accent">Sign up for free</a>
          </p>
        </div>
        
        {/* Doodles at bottom */}
        <LoginDoodles
          isWatching={true}
          isLookingAtButton={isLookingAtButton}
          isShakingHead={isShakingHead}
          isNodding={isNodding}
          isLookingAway={isLookingAway}
          passwordVisible={passwordVisible}
        />
        </div>
        
        {/* 3D Illustration Section */}
        <div className="login-illustration-section">
          <Login3DIllustration />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
