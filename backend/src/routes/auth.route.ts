import { Router } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { NodemailerEmailService } from '../services/NodemailerEmailService';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';
import { authGuard } from '../middlewares/authGuard';
import { validate } from '../middlewares/validate';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middlewares/schemas/auth.schema';

// ─── Dependency Injection Wiring ──────────────────────────────────────────────
const userRepository = new UserRepository();
const emailService = new NodemailerEmailService();
const authService = new AuthService(userRepository, emailService);
const authController = new AuthController(authService);

export const authRouter = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
authRouter.post('/signup', validate(signupSchema), authController.signup);
authRouter.post('/login',  validate(loginSchema),  authController.login);
authRouter.post('/refresh',                        authController.refresh);
authRouter.post('/logout',                         authController.logout);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
authRouter.get('/me', authGuard, authController.getMe);
