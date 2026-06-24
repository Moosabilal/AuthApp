import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UserRepository } from '../repositories/UserRepository';
import { NodemailerEmailService } from '../services/NodemailerEmailService';
import { CloudinaryStorageService } from '../services/CloudinaryStorageService';
import { ProfileService } from '../services/ProfileService';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { ProfileController } from '../controllers/ProfileController';
import { authGuard } from '../middlewares/authGuard';
import { validate } from '../middlewares/validate';
import { updateProfileSchema, requestEmailChangeSchema, verifyEmailChangeSchema } from '../middlewares/schemas/profile.schema';
import { AppError } from '../utils/AppError';


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'authapp/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});


const userRepository = new UserRepository();
const emailService = new NodemailerEmailService();
const storageService = new CloudinaryStorageService();
const profileService = new ProfileService(userRepository, emailService, storageService);
const profileController = new ProfileController(profileService);

export const profileRouter = Router();


profileRouter.use(authGuard);


const uploadAvatarMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const uploadSingle = upload.single('avatar');
  uploadSingle(req, res, (err) => {
    if (err) {
      return next(new AppError(`Cloudinary Upload Error: ${err.message}`, 400));
    }
    next();
  });
};


profileRouter.patch('/', uploadAvatarMiddleware, validate(updateProfileSchema), profileController.updateProfile);
profileRouter.post('/request-email-change', validate(requestEmailChangeSchema), profileController.requestEmailChange);
profileRouter.post('/verify-email', validate(verifyEmailChangeSchema), profileController.verifyEmailChange);
