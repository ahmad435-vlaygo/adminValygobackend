/**
 * Maps referral codes to sales agents. Keeps sales referral data separate from the main User collection.
 * When a user signs up with a code in this collection, valygo-pay should set user.salesAgentReferralCode = code.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISalesReferralCode extends Document {
  referralCode: string;
  salesTeamUserId: Types.ObjectId;
  createdAt: Date;
}

const salesReferralCodeSchema = new Schema<ISalesReferralCode>(
  {
    referralCode: { type: String, required: true, unique: true },
    salesTeamUserId: { type: Schema.Types.ObjectId, ref: 'SalesTeamUser', required: true },
  },
  { timestamps: true }
);

salesReferralCodeSchema.index({ referralCode: 1 });
salesReferralCodeSchema.index({ salesTeamUserId: 1 });

export default mongoose.model<ISalesReferralCode>('SalesReferralCode', salesReferralCodeSchema);
