import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * Auth Guard Middleware
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 * Passes an AppError(401) to next() if anything is wrong.
 */
export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Access denied. Authorization header missing or malformed.', 401));
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    next(new AppError('Access denied. Token not found in Authorization header.', 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // typed as AccessTokenPayload via express.d.ts augmentation
    next();
  } catch (err) {
    // verifyAccessToken already throws AppError(401) — forward it
    next(err);
  }
};
