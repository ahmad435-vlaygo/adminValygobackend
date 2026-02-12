/**
 * Tracks users who signed up with a sales agent's referral code (written by valygo-pay on registration).
 * Does not modify User - separate collection only.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISalesReferralSignup extends Document {
  userId: Types.ObjectId;
  referralCode: string;
  createdAt: Date;
}

const salesReferralSignupSchema = new Schema<ISalesReferralSignup>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referralCode: { type: String, required: true },
  },
  { timestamps: true }
);

salesReferralSignupSchema.index({ referralCode: 1 });

export default mongoose.model<ISalesReferralSignup>('SalesReferralSignup', salesReferralSignupSchema);
