const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify API Key
const verifyAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'No API key provided' });
    }

    const APIKey = require('../models/APIKey');
    const key = await APIKey.findOne({ key: apiKey, isActive: true });

    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    req.apiKey = key;
    req.apiId = key.apiId;
    req.userId = key.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'API key verification failed' });
  }
};

// Check Role-Based Access
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user owns the resource
const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    
    if (req.user.role !== 'admin' && req.user._id.toString() !== resourceUserId?.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    next();
  };
};

// Rate limiting middleware for general requests
const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  const requests = {};

  return (req, res, next) => {
    const identifier = req.userId || req.ip;
    const now = Date.now();

    if (!requests[identifier]) {
      requests[identifier] = [];
    }

    // Remove old requests outside the window
    requests[identifier] = requests[identifier].filter(time => now - time < windowMs);

    if (requests[identifier].length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    requests[identifier].push(now);
    next();
  };
};

module.exports = {
  verifyToken,
  verifyAPIKey,
  authorizeRole,
  checkResourceOwnership,
  rateLimitMiddleware
};
