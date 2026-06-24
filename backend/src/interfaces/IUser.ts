import { Types } from 'mongoose';





export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  
  password: string;
  
  refreshToken: string | null;
  
  avatarUrl?: string;
  
  passwordResetToken?: string;
  
  passwordResetExpires?: Date;
  
  pendingEmail?: string;
  
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}




export interface CreateUserDto {
  name: string;
  email: string;
  password: string; 
}
