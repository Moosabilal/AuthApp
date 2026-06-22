import { AccessTokenPayload } from '../utils/jwt';

// Augment Express's Request interface so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
