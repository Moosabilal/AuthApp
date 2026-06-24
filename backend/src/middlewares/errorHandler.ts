import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';



interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: MongoError): AppError => {
  const message = `Invalid ${err.path}: ${String(err.value)}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const value = Object.values(err.keyValue ?? {}).join(', ');
  const message = `Duplicate field value: '${value}'. Please use a different value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err: MongoError): AppError => {
  const errors = Object.values(err.errors ?? {}).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your session has expired. Please log in again.', 401);



const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    
    console.error('💥 UNEXPECTED ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong. Please try again later.',
    });
  }
};



export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const baseErr = err as AppError & MongoError;
  const statusCode = baseErr.statusCode ?? 500;

  
  let normalisedErr = new AppError(err.message, statusCode);

  if (env.NODE_ENV === 'development') {
    sendErrorDev(normalisedErr, res);
    return;
  }

  
  if (baseErr.name === 'CastError') normalisedErr = handleCastErrorDB(baseErr);
  else if (baseErr.code === 11000) normalisedErr = handleDuplicateFieldsDB(baseErr);
  else if (baseErr.name === 'ValidationError') normalisedErr = handleValidationErrorDB(baseErr);
  else if (baseErr.name === 'JsonWebTokenError') normalisedErr = handleJWTError();
  else if (baseErr.name === 'TokenExpiredError') normalisedErr = handleJWTExpiredError();

  sendErrorProd(normalisedErr, res);
};
