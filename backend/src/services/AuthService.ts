import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IUser } from '../interfaces/IUser';
import { AppError } from '../utils/AppError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

// ─── Public Types ─────────────────────────────────────────────────────────────

/** User shape returned to the client — sensitive fields stripped */
export type PublicUser = Omit<IUser, 'password' | 'refreshToken'>;

export interface AuthPayload {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

const BCRYPT_ROUNDS = 12;

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  // ── Signup ─────────────────────────────────────────────────────────────────

  async signup(name: string, email: string, password: string): Promise<AuthPayload> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepo.create({ name, email, password: hashed });

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const refreshToken = signRefreshToken(user._id.toString());
    await this.userRepo.updateRefreshToken(user._id.toString(), refreshToken);

    return { user: this.sanitise(user), accessToken, refreshToken };
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthPayload> {
    // Fetch user WITH password (explicit select in repository)
    const user = await this.userRepo.findByEmailWithPassword(email);

    // Use a constant-time message to prevent email enumeration
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const refreshToken = signRefreshToken(user._id.toString());
    await this.userRepo.updateRefreshToken(user._id.toString(), refreshToken);

    return { user: this.sanitise(user), accessToken, refreshToken };
  }

  // ── Refresh (token rotation) ────────────────────────────────────────────────

  async refresh(incomingToken: string): Promise<AuthPayload> {
    // 1. Verify JWT signature + expiry first (cheap, avoids DB hit on bad tokens)
    const jwtPayload = verifyRefreshToken(incomingToken);

    // 2. Confirm token exists in DB (server-side revocation check)
    const user = await this.userRepo.findByRefreshToken(incomingToken);
    if (!user || jwtPayload.sub !== user._id.toString()) {
      throw new AppError('Refresh token is invalid or has been revoked. Please log in again.', 401);
    }

    // 3. Rotate: issue a new pair and overwrite the old one
    const accessToken = signAccessToken(user._id.toString(), user.email);
    const newRefreshToken = signRefreshToken(user._id.toString());
    await this.userRepo.updateRefreshToken(user._id.toString(), newRefreshToken);

    // 4. Re-fetch clean user without sensitive fields
    const cleanUser = await this.userRepo.findById(user._id.toString());
    if (!cleanUser) throw new AppError('User no longer exists.', 401);

    return { user: this.sanitise(cleanUser), accessToken, refreshToken: newRefreshToken };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null);
  }

  // ── Get Me ─────────────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('User no longer exists.', 404);
    return this.sanitise(user);
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /** Return only the fields safe to expose to the client. */
  private sanitise(user: IUser): PublicUser {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
