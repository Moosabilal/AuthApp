import { IUser, CreateUserDto } from './IUser';

// ─── Repository Contract (Dependency Inversion Principle) ─────────────────────
// The service layer depends on this abstraction, NOT on a concrete Mongoose
// implementation. Any data source (MongoDB, PostgreSQL, in-memory) can satisfy
// this interface without changing service code.

export interface IUserRepository {
  /**
   * Find a user by email — password field excluded.
   * Use for existence checks, profile lookups, etc.
   */
  findByEmail(email: string): Promise<IUser | null>;

  /**
   * Find a user by email — explicitly includes the hashed password field.
   * Use ONLY in the login flow where bcrypt comparison is required.
   */
  findByEmailWithPassword(email: string): Promise<IUser | null>;

  /**
   * Find a user by MongoDB ObjectId string — password and token excluded.
   */
  findById(id: string): Promise<IUser | null>;

  /**
   * Find a user whose refreshToken matches the provided value.
   * Explicitly includes the refreshToken field (select: false on schema).
   * Used during token rotation to validate and revoke previous tokens.
   */
  findByRefreshToken(refreshToken: string): Promise<IUser | null>;

  /**
   * Persist a new user document. Expects a pre-hashed password.
   * Returns the created user (password excluded).
   */
  create(data: CreateUserDto): Promise<IUser>;

  /**
   * Overwrite the stored refreshToken for a user.
   * Pass null to revoke the session (logout).
   */
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
}
