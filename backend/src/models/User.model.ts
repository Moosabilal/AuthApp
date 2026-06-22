import { Schema, model, Document, Types } from 'mongoose';

// ─── Mongoose Document Interface ──────────────────────────────────────────────
// Extends Document so Mongoose gets its internal fields (_id, __v, save, etc.)
// while we add our own typed fields. This stays in the data layer only.

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;       // select: false — excluded by default
  refreshToken: string | null; // select: false — excluded by default
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema Definition ────────────────────────────────────────────────────────

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
      select: false, // ← CRITICAL: never returned in query results by default
    },

    refreshToken: {
      type: String,
      default: null,
      select: false, // ← Excluded from query results; only fetched when needed
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    versionKey: false, // removes __v field from documents
    // Sanitise output: strip __id internal references and rename _id to id
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email is already indexed via unique: true above.
// Sparse index on refreshToken supports fast session lookups during rotation.
userSchema.index({ refreshToken: 1 }, { sparse: true });

// ─── Model Export ─────────────────────────────────────────────────────────────
export const User = model<IUserDocument>('User', userSchema);
