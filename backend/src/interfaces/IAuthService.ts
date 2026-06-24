import { AuthPayload, PublicUser } from '../services/AuthService';

export interface IAuthService {
  signup(name: string, email: string, password: string): Promise<AuthPayload>;
  login(email: string, password: string): Promise<AuthPayload>;
  refresh(incomingToken: string): Promise<AuthPayload>;
  logout(userId: string): Promise<void>;
  getMe(userId: string): Promise<PublicUser>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}
