import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

// ─── Token Payload Shapes ─────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;   // user MongoDB ObjectId as string
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export const signAccessToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

// ─── Verify ───────────────────────────────────────────────────────────────────

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Access token has expired.', 401);
    }
    throw new AppError('Invalid access token.', 401);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid refresh token. Please log in again.', 401);
  }
};
