import { ZodSchema } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Middleware factory that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (and transformed) data.
 * On failure, passes a 422 AppError to the global error handler.
 */
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

    req.body = result.data; // enriched with any Zod transforms (trim, lowercase, etc.)
    next();
  };
};
