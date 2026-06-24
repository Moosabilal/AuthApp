import './config/env'; 

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env';
import { connectDB } from './config/db';
import { corsOptions } from './config/corsOptions';
import { router } from './routes';
import { globalErrorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app: Application = express();


app.use(helmet());
app.use(cors(corsOptions));


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());


if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

import path from 'path';


app.use('/api', router);


app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


app.all('*', (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route '${req.originalUrl}' not found on this server.`, 404));
});


app.use(globalErrorHandler);


const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀  Server is running at http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    console.log(`📋  Health check: http://localhost:${env.PORT}/api/health\n`);
  });

  
  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚡  ${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('💤  HTTP server closed.');
      try {
        const mongoose = await import('mongoose');
        await mongoose.connection.close();
        console.log('🍃  MongoDB connection closed.');
      } catch {
        console.error('⚠️   Failed to close MongoDB connection cleanly.');
      }
      process.exit(0);
    });

    
    setTimeout(() => {
      console.error('⏱   Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥  UNHANDLED REJECTION:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    console.error('💥  UNCAUGHT EXCEPTION:', err.message);
    process.exit(1);
  });
};

void startServer();
