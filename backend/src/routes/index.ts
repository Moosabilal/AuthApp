import { Router } from 'express';
import { healthRouter } from './health.route';
import { authRouter } from './auth.route';
import { profileRouter } from './profile.route';

export const router = Router();


router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
