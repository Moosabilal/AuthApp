import { Request, Response } from 'express';
import { IAuthService } from '../interfaces/IAuthService';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../middlewares/schemas/auth.schema';

const REFRESH_COOKIE = 'refreshToken';


const cookieOptions = () => ({
  httpOnly: true,                              
  secure: env.NODE_ENV === 'production',       
  sameSite: 'strict' as const,               
  maxAge: 7 * 24 * 60 * 60 * 1000,           
  path: '/api/auth',                           
});

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  

  signup = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as SignupInput;
    const result = await this.authService.signup(name, email, password);

    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions());
    res.status(201).json({
      status: 'success',
      data: { user: result.user, accessToken: result.accessToken },
    });
  });

  

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginInput;
    const result = await this.authService.login(email, password);

    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions());
    res.status(200).json({
      status: 'success',
      data: { user: result.user, accessToken: result.accessToken },
    });
  });

  

  refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const incomingToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!incomingToken) {
      throw new AppError('No refresh token provided. Please log in.', 401);
    }

    const result = await this.authService.refresh(incomingToken);

    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions());
    res.status(200).json({
      status: 'success',
      data: { user: result.user, accessToken: result.accessToken },
    });
  });

  

  logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const incomingToken = req.cookies[REFRESH_COOKIE] as string | undefined;

    if (incomingToken) {
      try {
        
        const payload = verifyRefreshToken(incomingToken);
        await this.authService.logout(payload.sub);
      } catch {
        
      }
    }

    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.status(200).json({
      status: 'success',
      message: 'You have been logged out successfully.',
    });
  });

  

  getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
    
    const userId = req.user!.sub;
    const user = await this.authService.getMe(userId);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  

  forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as ForgotPasswordInput;
    await this.authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  });

  

  resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const { newPassword } = req.body as ResetPasswordInput;
    
    await this.authService.resetPassword(token, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password has been successfully reset. Please log in.',
    });
  });
}
