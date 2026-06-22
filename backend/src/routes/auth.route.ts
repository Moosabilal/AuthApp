import { Router } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';
import { authGuard } from '../middlewares/authGuard';
import { validate } from '../middlewares/validate';
import { signupSchema, loginSchema } from '../middlewares/schemas/auth.schema';

// ─── Dependency Injection Wiring ──────────────────────────────────────────────
// Instantiated once at module load; singletons shared across all requests.
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
authRouter.post('/signup', validate(signupSchema), authController.signup);
authRouter.post('/login',  validate(loginSchema),  authController.login);
authRouter.post('/refresh',                        authController.refresh);
authRouter.post('/logout',                         authController.logout);

// ── Protected routes ──────────────────────────────────────────────────────────
authRouter.get('/me', authGuard, authController.getMe);
