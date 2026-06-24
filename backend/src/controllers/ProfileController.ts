import { Request, Response } from 'express';
import { ProfileService } from '../services/ProfileService';
import { catchAsync } from '../utils/catchAsync';
import { UpdateProfileInput, RequestEmailChangeInput } from '../middlewares/schemas/profile.schema';

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  

  updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.sub;
    const data = req.body as UpdateProfileInput;
    const file = req.file;
    
    const updatedUser = await this.profileService.updateProfile(userId, data, file);

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  });

  

  requestEmailChange = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.sub;
    const { newEmail } = req.body as RequestEmailChangeInput;

    await this.profileService.requestEmailChange(userId, newEmail);

    res.status(200).json({
      status: 'success',
      message: 'A verification link has been sent to your new email address.',
    });
  });

  

  verifyEmailChange = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { otp } = req.body;

    await this.profileService.verifyEmailChange(otp);

    res.status(200).json({
      status: 'success',
      message: 'Email successfully verified and updated.',
    });
  });
}
