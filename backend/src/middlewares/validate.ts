import { ZodSchema } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/AppError';


export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      next(new AppError(message, 422));
      return;
    }

    req.body = result.data; 
    next();
  };
};
