import { IEmailService } from '../interfaces/IEmailService';
import { env } from '../config/env';

/**
 * Mock Email Service used for development.
 * Logs the email content and "magic link" URLs to the server console.
 * In production, this can be swapped with a SendGridEmailService or NodemailerService.
 */
export class EmailService implements IEmailService {
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const magicLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
    
    console.log('\n========================================================');
    console.log(`✉️  MOCK EMAIL DISPATCHED`);
    console.log(`To: ${to}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click the link below to reset your password.`);
    console.log(`🔗 Magic Link: ${magicLink}`);
    console.log('========================================================\n');
  }

  async sendEmailVerification(to: string, otp: string): Promise<void> {
    console.log('\n========================================================');
    console.log(`✉️  MOCK EMAIL DISPATCHED`);
    console.log(`To: ${to}`);
    console.log(`Subject: Verify Your New Email Address`);
    console.log(`Body: Your OTP for email verification is: ${otp}`);
    console.log(`    (Enter this 6-digit code in the application)`);
    console.log('========================================================\n');
  }

  async sendEmailChangeConfirmation(to: string): Promise<void> {
    console.log('\n========================================================');
    console.log(`✉️  MOCK EMAIL DISPATCHED`);
    console.log(`To: ${to}`);
    console.log(`Subject: Email Address Updated Successfully`);
    console.log(`Body: Your email address has been successfully updated in our system.`);
    console.log('========================================================\n');
  }

  async sendSecurityAlertEmailChanged(to: string): Promise<void> {
    console.log('\n========================================================');
    console.log(`✉️  MOCK EMAIL DISPATCHED (SECURITY ALERT)`);
    console.log(`To: ${to}`);
    console.log(`Subject: SECURITY ALERT: Email Address Changed`);
    console.log(`Body: The email associated with your account was just changed. If this wasn't you, contact support immediately.`);
    console.log('========================================================\n');
  }
}
