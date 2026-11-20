const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

/**
 * Authentication Middleware: Validates JWT token from the Authorization header
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Authentication token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Token missing.'
      });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_store_rating_2026_change_in_production';

    // Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    // Check if user still exists in DB
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    // Attach verified user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Authorization Middleware: Restricts route to specific user roles
 * Example usage: authorizeRoles('ADMIN'), authorizeRoles('ADMIN', 'OWNER')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Role authorization failed.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only [${allowedRoles.join(', ')}] are permitted to perform this action.`
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware: If token is provided, decodes user; if not, proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_store_rating_2026_change_in_production';
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    } catch (e) {
      // Token invalid or expired, continue as guest
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
};
