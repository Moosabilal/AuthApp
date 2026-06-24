import nodemailer from 'nodemailer';
import { IEmailService } from '../interfaces/IEmailService';
import { env } from '../config/env';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const magicLink = `${env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <h2 style="color: #0f1729; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          We received a request to reset your AuthFlow password.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          Click the secure button below to choose a new password. This link is valid for a limited time.
        </p>
        <div style="margin: 30px 0;">
          <a href="${magicLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'AuthFlow - Password Reset Request',
      html,
    });
  }

  async sendEmailVerification(to: string, otp: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <h2 style="color: #0f1729; margin-bottom: 20px;">Verify Your New Email Address</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          You are updating your AuthFlow email address.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          Please enter the following 6-digit One-Time Password (OTP) in your dashboard to verify this address:
        </p>
        <div style="margin: 30px 0;">
          <div style="background-color: #e0e7ff; color: #4f46e5; padding: 16px 24px; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 6px; text-align: center;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          If you didn't request this, please contact support immediately.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'AuthFlow - Email Verification OTP',
      html,
    });
  }

  async sendEmailChangeConfirmation(to: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <h2 style="color: #0f1729; margin-bottom: 20px;">Email Updated Successfully</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          Your email address has been successfully verified and updated.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          You can now use this email address to log in to your AuthFlow account.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'AuthFlow - Email Updated Successfully',
      html,
    });
  }

  async sendSecurityAlertEmailChanged(to: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px;">
        <h2 style="color: #be123c; margin-bottom: 20px;">Security Alert: Email Address Changed</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          The email address associated with your AuthFlow account was just changed.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 16px; font-weight: bold;">
          If you made this change, you can safely ignore this email.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 16px;">
          If you did NOT authorize this change, please contact our security team immediately to secure your account.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'SECURITY ALERT: Email Address Changed',
      html,
    });
  }
}
