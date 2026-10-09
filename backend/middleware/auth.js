import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      return next(error);
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  try {
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    if (user.role !== decoded.role) return res.status(401).json({ success: false, message: 'Account role changed; sign in again' });

    req.user = user;
  } catch (error) {
    return next(error);
  }
  return next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to access this resource' });
  }
  next();
};

export const requirePasswordChangeComplete = (req, res, next) => {
  if (req.user?.mustChangePassword) {
    return res.status(403).json({
      success: false,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'Change your initial password before accessing student records',
    });
  }
  next();
};
