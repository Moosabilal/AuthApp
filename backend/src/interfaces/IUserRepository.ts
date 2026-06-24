import { IUser, CreateUserDto } from './IUser';






export interface IUserRepository {
  
  findByEmail(email: string): Promise<IUser | null>;

  
  findByEmailWithPassword(email: string): Promise<IUser | null>;

  
  findById(id: string): Promise<IUser | null>;

  
  findByRefreshToken(refreshToken: string): Promise<IUser | null>;

  
  create(data: CreateUserDto): Promise<IUser>;

  
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;

  
  setPasswordResetToken(userId: string, hashedToken: string | null, expires: Date | null): Promise<void>;

  
  findByPasswordResetToken(hashedToken: string): Promise<IUser | null>;

  
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  
  updateProfile(userId: string, data: { name?: string; avatarUrl?: string }): Promise<IUser | null>;

  
  setEmailVerificationToken(userId: string, pendingEmail: string | null, hashedToken: string | null): Promise<void>;

  
  findByEmailVerificationToken(hashedToken: string): Promise<IUser | null>;

  
  updateEmail(userId: string, newEmail: string): Promise<void>;
}
