import { Types } from 'mongoose';
import { IUser, CreateUserDto } from '../interfaces/IUser';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User, IUserDocument } from '../models/User.model';




const toIUser = (doc: IUserDocument | Record<string, unknown>): IUser => doc as unknown as IUser;





export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await User.findOne({ email }).lean();
    return doc ? toIUser(doc) : null;
  }

  
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    const doc = await User.findOne({ email }).select('+password').lean();
    return doc ? toIUser(doc) : null;
  }

  
  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await User.findById(id).lean();
    return doc ? toIUser(doc) : null;
  }

  
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ refreshToken })
      .select('+refreshToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  
  async create(data: CreateUserDto): Promise<IUser> {
    const created = await User.create(data);
    
    const doc = await User.findById(created._id).lean();
    if (!doc) {
      throw new Error('User creation succeeded but document could not be retrieved.');
    }
    return toIUser(doc);
  }

  
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $set: { refreshToken } },
      { new: false } 
    );
  }

  async setPasswordResetToken(userId: string, hashedToken: string | null, expires: Date | null): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $set: { passwordResetToken: hashedToken, passwordResetExpires: expires } },
      { new: false }
    );
  }

  async findByPasswordResetToken(hashedToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ 
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() } 
    })
      .select('+passwordResetToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { password: passwordHash },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 } 
      },
      { new: false }
    );
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }): Promise<IUser | null> {
    const doc = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    return doc ? toIUser(doc) : null;
  }

  async setEmailVerificationToken(userId: string, pendingEmail: string | null, hashedToken: string | null): Promise<void> {
    if (pendingEmail && hashedToken) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { pendingEmail, emailVerificationToken: hashedToken } },
        { new: false }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $unset: { pendingEmail: 1, emailVerificationToken: 1 } },
        { new: false }
      );
    }
  }

  async findByEmailVerificationToken(hashedToken: string): Promise<IUser | null> {
    const doc = await User.findOne({ emailVerificationToken: hashedToken })
      .select('+emailVerificationToken')
      .lean();
    return doc ? toIUser(doc) : null;
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { email: newEmail },
        $unset: { pendingEmail: 1, emailVerificationToken: 1 }
      },
      { new: false, runValidators: true }
    );
  }
}
