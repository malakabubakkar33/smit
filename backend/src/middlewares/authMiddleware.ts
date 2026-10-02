import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { db } from '../config/database.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
    return;
  }
};

export const requireTeacher = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'teacher') {
    res.status(403).json({ success: false, message: 'Access denied. Teacher/Admin privileges required.' });
    return;
  }

  next();
};

export const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'student') {
    res.status(403).json({ success: false, message: 'Access denied. Student privileges required.' });
    return;
  }

  const user = db.users.find(u => u.id === req.user?.userId);
  if (user && (user.is_dropped || !user.is_active)) {
    res.status(403).json({
      success: false,
      isDropped: !!user.is_dropped,
      message: user.is_dropped
        ? `CLASS EXPULSION NOTICE: Your enrollment has been terminated. ${user.dropped_reason || 'Critical attendance deficit (<65%).'} Contact instructor Sir Tatheer for appeal.`
        : 'Your student account is currently disabled. Please contact your instructor.'
    });
    return;
  }

  next();
};
