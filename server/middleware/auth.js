const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Support both cookie-based sessions (web) and header-based session ID (React Native)
    let sessionId = null;
    
    // Check for session ID in custom header (for React Native)
    if (req.headers['x-session-id']) {
      sessionId = req.headers['x-session-id'];
      
      // Load session by ID using promise
      const session = await new Promise((resolve, reject) => {
        req.sessionStore.get(sessionId, (err, session) => {
          if (err) reject(err);
          else resolve(session);
        });
      });

      if (!session || !session.userId) {
        return res.status(401).json({ message: 'Not authenticated. Please login again.' });
      }

      // Set session data on request
      req.session = session;
      req.sessionID = sessionId;

      // Fetch user from database
      const user = await User.findById(session.userId).select('-password');
      
      if (!user) {
        // User was deleted but session still exists - destroy session
        await new Promise((resolve) => {
          req.sessionStore.destroy(sessionId, resolve);
        });
        return res.status(401).json({ message: 'User not found. Please login again.' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } else {
      // Cookie-based session (web)
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated. Please login again.' });
      }

      // Fetch user from database
      const user = await User.findById(req.session.userId).select('-password');
      
      if (!user) {
        // User was deleted but session still exists - destroy session
        req.session.destroy();
        return res.status(401).json({ message: 'User not found. Please login again.' });
      }

      // Attach user to request object
      req.user = user;
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed. Please login again.' });
  }
};

module.exports = { authenticate };


