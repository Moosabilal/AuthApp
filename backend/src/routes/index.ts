import { Router } from 'express';
import { healthRouter } from './health.route';
import { authRouter } from './auth.route';

export const router = Router();

// ── Mounted sub-routers ───────────────────────────────────────────────────────
router.use('/health', healthRouter);
router.use('/auth', authRouter);

