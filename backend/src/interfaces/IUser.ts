import { Types } from 'mongoose';

// ─── Core User Entity ─────────────────────────────────────────────────────────
// This is the domain-layer interface. All layers above the data layer work with
// IUser, keeping them decoupled from Mongoose documents.

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  /**
   * Always excluded from query results by default (select: false on schema).
   * Only present when explicitly selected by the repository layer.
   */
  password: string;
  /**
   * Single active refresh token per session. Rotated on every refresh call.
   * Excluded from query results by default (select: false on schema).
   * Set to null on logout to revoke the session.
   */
  refreshToken: string | null;
  /** Public URL for the user's avatar image. */
  avatarUrl?: string;
  /** Hashed token for password reset verification (select: false). */
  passwordResetToken?: string;
  /** Expiry date for the password reset token. */
  passwordResetExpires?: Date;
  /** Stores the requested new email until it is verified. */
  pendingEmail?: string;
  /** Hashed token to verify the pendingEmail (select: false). */
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Data Transfer Objects ────────────────────────────────────────────────────

/**
 * Input shape for user registration.
 * Password must already be hashed by the service layer before passing here.
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string; // bcrypt hash
}
