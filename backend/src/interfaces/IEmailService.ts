export interface IEmailService {
  /**
   * Dispatches a password reset link to the user.
   * @param to Target email address
   * @param token Secure hex token to be embedded in the magic link
   */
  sendPasswordResetEmail(to: string, token: string): Promise<void>;

  /**
   * Dispatches an email verification OTP.
   * Used when users request to change their primary email.
   * @param to The NEW email address that needs verification
   * @param otp Secure 6-digit OTP
   */
  sendEmailVerification(to: string, otp: string): Promise<void>;

  /**
   * Dispatches a confirmation to the newly verified email address.
   * @param to The new email address
   */
  sendEmailChangeConfirmation(to: string): Promise<void>;

  /**
   * Dispatches a security alert to the old email address notifying them
   * that their account email was changed.
   * @param to The old email address
   */
  sendSecurityAlertEmailChanged(to: string): Promise<void>;
}
