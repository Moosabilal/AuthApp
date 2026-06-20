import { Router } from 'express';
import { healthRouter } from './health.route';

export const router = Router();

// ── Mounted sub-routers ───────────────────────────────────────────────────────
router.use('/health', healthRouter);

// Auth routes are mounted in Step 4 (feat/auth-logic)
// router.use('/auth', authRouter);
