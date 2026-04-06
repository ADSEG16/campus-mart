const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const requireUser = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const fallbackUserId = req.header('x-user-id');
    let userId = fallbackUserId;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (!userId) {
      return sendError(res, { statusCode: 401, message: 'Authentication required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid user' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, { statusCode: 403, message: 'Admin access required' });
  }
  return next();
};

/**
 * CMP-22: JWT Auth Middleware
 * - Verifies JWT validity
 * - Attaches user ID and role from JWT to req.user
 * - Blocks access if token is missing or invalid
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, {
          statusCode: 401,
          message: 'Token has expired.',
        });
      }
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid token.',
      });
    }

    const user = await User.findById(decoded.id).select('_id role');

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User no longer exists.',
      });
    }

    // Attach only ID and role from JWT to request
    req.user = {
      _id: user._id,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requireUser,
  requireAdmin,
  verifyJWT,
};