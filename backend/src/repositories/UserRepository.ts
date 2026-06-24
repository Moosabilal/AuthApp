import { Types } from 'mongoose';
import { IUser, CreateUserDto } from '../interfaces/IUser';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User, IUserDocument } from '../models/User.model';

// ─── Type Helper ──────────────────────────────────────────────────────────────
// Converts a Mongoose lean document (or HydratedDocument) to the plain IUser
// interface that the service layer expects. Keeps the data layer boundary clean.
const toIUser = (doc: IUserDocument | Record<string, unknown>): IUser => doc as unknown as IUser;

// ─── Concrete Repository ──────────────────────────────────────────────────────
// Satisfies the IUserRepository contract using Mongoose as the underlying ORM.
// The service layer depends only on IUserRepository — it never imports this file.

export class UserRepository implements IUserRepository {
  /**
   * Find a user by email without sensitive fields.
   * Safe to use in any context that doesn't require password comparison.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await User.findOne({ email }).lean();
    return doc ? toIUser(doc) : null;
  }

  /**
   * Find a user by email and explicitly include the hashed password.
   * Use ONLY in the login flow before bcrypt.compare().
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    const doc = await User.findOne({ email }).select('+password').lean();
    return doc ? toIUser(doc) : null;
  }

  /**
   * Find a user by MongoDB ObjectId string.
   * Used by the auth guard middleware to attach req.user after token verification.
   */
  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await User.findById(id).lean();
    return doc ? toIUser(doc) : null;
  }

  /**
   * Find a user whose stored refreshToken matches the provided token.
   * Explicitly selects refreshToken (select: false on schema).
   * Used during token rotation to verify the incoming cookie before issuing
   * a new access/refresh token pair.
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ refreshToken })
      .select('+refreshToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  /**
   * Insert a new user document. Expects a pre-hashed password from the service.
   * Returns the created user with password stripped (leveraging select: false).
   */
  async create(data: CreateUserDto): Promise<IUser> {
    const created = await User.create(data);
    // Re-fetch without password to return a clean IUser
    const doc = await User.findById(created._id).lean();
    if (!doc) {
      throw new Error('User creation succeeded but document could not be retrieved.');
    }
    return toIUser(doc);
  }

  /**
   * Overwrite the refreshToken field for a given user.
   * Pass null to clear the token and revoke the session on logout.
   * Uses findByIdAndUpdate for a targeted single-field write.
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $set: { refreshToken } },
      { new: false } // we don't need the updated document back
    );
  }

  async setPasswordResetToken(userId: string, hashedToken: string | null, expires: Date | null): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $set: { passwordResetToken: hashedToken, passwordResetExpires: expires } },
      { new: false }
    );
  }

  async findByPasswordResetToken(hashedToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ 
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() } // MUST be valid (future date)
    })
      .select('+passwordResetToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { password: passwordHash },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 } 
      },
      { new: false }
    );
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }): Promise<IUser | null> {
    const doc = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    return doc ? toIUser(doc) : null;
  }

  async setEmailVerificationToken(userId: string, pendingEmail: string | null, hashedToken: string | null): Promise<void> {
    if (pendingEmail && hashedToken) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { pendingEmail, emailVerificationToken: hashedToken } },
        { new: false }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $unset: { pendingEmail: 1, emailVerificationToken: 1 } },
        { new: false }
      );
    }
  }

  async findByEmailVerificationToken(hashedToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ emailVerificationToken: hashedToken })
      .select('+emailVerificationToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { email: newEmail },
        $unset: { pendingEmail: 1, emailVerificationToken: 1 }
      },
      { new: false, runValidators: true }
    );
  }
}
