export interface IEmailService {
  
  sendPasswordResetEmail(to: string, token: string): Promise<void>;

  
  sendEmailVerification(to: string, otp: string): Promise<void>;

  
  sendEmailChangeConfirmation(to: string): Promise<void>;

  
  sendSecurityAlertEmailChanged(to: string): Promise<void>;
}
