/**
 * App User model - mirrors valygo-pay-backend User schema for real data.
 * Use same MONGODB_URI as main app to read/write real users.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  title?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  status?: string;
  type?: string;
  referalCode?: string;
  referredBy?: Types.ObjectId | null;
  twoFAEnabled?: boolean;
  isEmailVerified?: boolean;
  walletAddress?: string;
  kyc?: {
    kycStatus?: boolean;
    kycUpdateStatus?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    title: { type: String, trim: true, default: '' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    status: { type: String, trim: true, default: 'active' },
    type: { type: String, trim: true, default: 'Simple' },
    referalCode: { type: String, default: '' },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    twoFAEnabled: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    walletAddress: { type: String, default: null },
    kyc: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ referredBy: 1 });

export default mongoose.model<IUser>('User', userSchema);
