const express = require('express');
const User = require('../models/User');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/emailService');
const router = express.Router();

// Initialize admin user
router.post('/init', async (req, res) => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(400).json({ 
        message: 'Admin password not configured. Please set ADMIN_PASSWORD environment variable.' 
      });
    }

    const adminExists = await User.findOne({ username: adminUsername });
    if (!adminExists) {
      const admin = new User({
        username: adminUsername,
        email: process.env.ADMIN_EMAIL || `${adminUsername}@spentee.com`,
        password: adminPassword,
        role: 'admin',
        emailVerified: true
      });
      await admin.save();
      return res.json({ message: 'Admin user created successfully' });
    }
    // Ensure existing admin has admin role
    if (adminExists.role !== 'admin') {
      adminExists.role = 'admin';
      await adminExists.save();
      return res.json({ message: 'Admin user role updated' });
    }
    res.json({ message: 'Admin user already exists' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing admin', error: error.message });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Generate email verification token (for future use)
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user (not verified yet)
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      accountDetails: {
        fullName: fullName || ''
      },
      emailVerificationToken,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
      emailVerified: false
    });

    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), otp);
    
    // If email service is not configured, log OTP for development
    if (!emailResult.success) {
      console.log('⚠️  Email service not configured. OTP for', email, ':', otp);
    }

    // Don't auto-login - require email verification first
    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the OTP sent to your email address.',
      requiresVerification: true,
      email: email.toLowerCase(), // Return email for OTP verification screen
      // Log OTP for development (if email not configured)
      ...(process.env.NODE_ENV === 'development' && !emailResult.success ? { devOTP: otp } : {}),
      // Don't return sessionId or user - they need to verify first
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'username' ? 'Username' : 'Email'} already exists` 
      });
    }
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
});

// Verify email with OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if OTP exists and matches
    if (!user.emailVerificationOTP) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Check if OTP expired
    if (!user.emailVerificationOTPExpiry || new Date() > user.emailVerificationOTPExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpiry = null;
    await user.save();

    // Auto-login after verification (create session)
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.role = user.role;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const sessionId = req.sessionID;

    res.json({
      success: true,
      message: 'Email verified successfully',
      sessionId: sessionId,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        accountDetails: user.accountDetails,
        emailVerified: user.emailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), otp);
    
    // If email service is not configured, log OTP for development
    if (!emailResult.success) {
      console.log('⚠️  Email service not configured. New OTP for', email, ':', otp);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Login - creates server-side session
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Login can use either username or email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session data (session ID is already generated by express-session)
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.role = user.role;

    // Get session ID
    const sessionId = req.sessionID;

    // Save session using promise
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Return session ID for React Native (since cookies don't work well)
    // Session ID is just an identifier, actual session data stays on server
    // For web clients, the cookie is automatically set by express-session
    res.json({
      success: true,
      sessionId: sessionId, // Also return for web clients in case they need it
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        accountDetails: user.accountDetails,
        emailVerified: user.emailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Logout - destroys session
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ message: 'Error logging out', error: err.message });
    }
    res.clearCookie('spentee.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/me', async (req, res) => {
  try {
    let session = req.session;
    
    // Support session ID header for React Native
    if (req.headers['x-session-id'] && !session?.userId) {
      const sessionId = req.headers['x-session-id'];
      session = await new Promise((resolve, reject) => {
        req.sessionStore.get(sessionId, (err, sess) => {
          if (err) reject(err);
          else resolve(sess);
        });
      });
    }

    if (!session || !session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      if (req.headers['x-session-id']) {
        await new Promise((resolve) => {
          req.sessionStore.destroy(req.headers['x-session-id'], resolve);
        });
      } else {
        req.session.destroy();
      }
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        accountDetails: user.accountDetails,
        emailVerified: user.emailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Error checking authentication', error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    let session = req.session;
    
    // Support session ID header for React Native
    if (req.headers['x-session-id'] && !session?.userId) {
      const sessionId = req.headers['x-session-id'];
      session = await new Promise((resolve, reject) => {
        req.sessionStore.get(sessionId, (err, sess) => {
          if (err) reject(err);
          else resolve(sess);
        });
      });
    }

    if (!session || !session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const { fullName, phoneNumber, dateOfBirth, address, profilePicture } = req.body;

    if (fullName !== undefined) user.accountDetails.fullName = fullName;
    if (phoneNumber !== undefined) user.accountDetails.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.accountDetails.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.accountDetails.address = address;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        accountDetails: user.accountDetails,
        emailVerified: user.emailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;


