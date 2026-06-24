import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEmailService } from '../interfaces/IEmailService';
import { IUser } from '../interfaces/IUser';
import { AppError } from '../utils/AppError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';




export type PublicUser = Omit<IUser, 'password' | 'refreshToken' | 'passwordResetToken' | 'passwordResetExpires' | 'emailVerificationToken'>;

export interface AuthPayload {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

const BCRYPT_ROUNDS = 12;



import { IAuthService } from '../interfaces/IAuthService';

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  

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

  

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.userRepo.findByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const refreshToken = signRefreshToken(user._id.toString());
    await this.userRepo.updateRefreshToken(user._id.toString(), refreshToken);

    return { user: this.sanitise(user), accessToken, refreshToken };
  }

  

  async refresh(incomingToken: string): Promise<AuthPayload> {
    const jwtPayload = verifyRefreshToken(incomingToken);

    const user = await this.userRepo.findByRefreshToken(incomingToken);
    if (!user || jwtPayload.sub !== user._id.toString()) {
      throw new AppError('Refresh token is invalid or has been revoked. Please log in again.', 401);
    }

    const accessToken = signAccessToken(user._id.toString(), user.email);
    const newRefreshToken = signRefreshToken(user._id.toString());
    await this.userRepo.updateRefreshToken(user._id.toString(), newRefreshToken);

    const cleanUser = await this.userRepo.findById(user._id.toString());
    if (!cleanUser) throw new AppError('User no longer exists.', 401);

    return { user: this.sanitise(cleanUser), accessToken, refreshToken: newRefreshToken };
  }

  

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null);
  }

  

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('User no longer exists.', 404);
    return this.sanitise(user);
  }

  

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepo.setPasswordResetToken(user._id.toString(), hashedToken, expires);

    
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepo.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userRepo.updatePassword(user._id.toString(), newHashedPassword);
  }

  

  private sanitise(user: IUser): PublicUser {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      pendingEmail: user.pendingEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
