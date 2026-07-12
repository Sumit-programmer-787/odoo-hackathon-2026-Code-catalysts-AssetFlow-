import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protects routes from unauthenticated traffic by asserting the validity of incoming Bearer JWT tokens.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Isolate token from incoming standard header string format 'Bearer <Token>'
      token = req.headers.authorization.split(' ')[1];

      // Decode validation token using standard secret signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Bind matching user document object directly into request context without exposing password hashes
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, target user resource no longer exists'));
      }

      return next();
    } catch (error) {
      console.error(`🔒 Auth Intercept Failure: ${error.message}`);
      res.status(401);
      return next(new Error('Not authorized, verification token has failed or expired'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, missing bearer token token signature'));
  }
};

/**
 * Dynamic RBAC Route Interceptor. Takes an array of acceptable roles and enforces access restrictions.
 * @param {...string} allowedRoles - The explicit human-readable system roles allowed to pass.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Authentication context missing on execution cycle'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403); // Forbidden status code explicit to access authorization failures
      return next(
        new Error(`Access denied. Role "${req.user.role}" does not hold clearance for this operation`)
      );
    }
    
    next();
  };
};