import crypto from 'crypto';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEmailService } from '../interfaces/IEmailService';
import { IStorageService } from '../interfaces/IStorageService';
import { PublicUser } from './AuthService';
import { AppError } from '../utils/AppError';

import { IProfileService } from '../interfaces/IProfileService';

export class ProfileService implements IProfileService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly storageService: IStorageService
  ) { }

  async updateProfile(userId: string, data: { name?: string }, file?: Express.Multer.File): Promise<PublicUser> {
    const updateData: { name?: string; avatarUrl?: string } = { ...data };

    if (file) {
      updateData.avatarUrl = await this.storageService.uploadAvatar(file.path);
    }

    const updatedUser = await this.userRepo.updateProfile(userId, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    return this.sanitise(updatedUser);
  }

  async requestEmailChange(userId: string, newEmail: string): Promise<void> {

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.email === newEmail) {
      throw new AppError('New email must be different from current email', 400);
    }

    const existingEmail = await this.userRepo.findByEmail(newEmail);
    if (existingEmail) {
      throw new AppError('This email is already in use', 409);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

    await this.userRepo.setEmailVerificationToken(userId, newEmail, hashedToken);


    await this.emailService.sendEmailVerification(newEmail, otp);
  }

  async verifyEmailChange(otp: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await this.userRepo.findByEmailVerificationToken(hashedToken);

    if (!user || !user.pendingEmail) {
      throw new AppError('Verification token is invalid or has expired', 400);
    }

    const oldEmail = user.email;
    const newEmail = user.pendingEmail;


    await this.userRepo.updateEmail(user._id.toString(), newEmail);


    await this.userRepo.updateRefreshToken(user._id.toString(), null);


    await this.emailService.sendEmailChangeConfirmation(newEmail);
    await this.emailService.sendSecurityAlertEmailChanged(oldEmail);
  }

  private sanitise(user: any): PublicUser {
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
