import { Schema, model, Document, Types } from 'mongoose';





export interface IUserDocument extends Document {
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



const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [64, 'Name cannot exceed 64 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, 
    },

    refreshToken: {
      type: String,
      default: null,
      select: false, 
    },

    avatarUrl: {
      type: String,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
    },

    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, 
    versionKey: false, 
    
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);




userSchema.index({ refreshToken: 1 }, { sparse: true });


export const User = model<IUserDocument>('User', userSchema);
