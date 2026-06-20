import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

const DB_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

healthRouter.get('/', (_req: Request, res: Response): void => {
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: DB_STATES[dbState] ?? 'unknown',
      host: mongoose.connection.host || 'N/A',
    },
  });
});
