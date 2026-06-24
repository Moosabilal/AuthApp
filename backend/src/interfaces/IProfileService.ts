import { PublicUser } from '../services/AuthService';

export interface IProfileService {
  updateProfile(userId: string, data: { name?: string }, file?: Express.Multer.File): Promise<PublicUser>;
  requestEmailChange(userId: string, newEmail: string): Promise<void>;
  verifyEmailChange(otp: string): Promise<void>;
}
