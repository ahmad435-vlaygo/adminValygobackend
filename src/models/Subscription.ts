/**
 * App Subscription model - mirrors valygo-pay-backend Subscription schema for real data.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

const AmountsSchema = new Schema(
  {
    deposit_lock_vyo: Schema.Types.Decimal128,
    one_time_fee_vyo: Schema.Types.Decimal128,
    monthly_fee_usd: { type: Number, default: 0 },
    monthly_fee_vyo: { type: Number, default: null },
  },
  { _id: false }
);

export interface ISubscription extends Document {
  user_id: Types.ObjectId;
  plan_display_name: string;
  external_plan_id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';
  billing_start: Date;
  billing_end: Date;
  next_billing_date?: Date;
  next_billing_amount?: number;
  amounts?: {
    monthly_fee_usd?: number;
    monthly_fee_vyo?: number | null;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan_display_name: { type: String, required: true },
    external_plan_id: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED'],
      required: true,
    },
    billing_start: { type: Date, required: true },
    billing_end: { type: Date, required: true },
    next_billing_date: { type: Date, default: null },
    next_billing_amount: { type: Number, default: null },
    amounts: { type: AmountsSchema, default: {} },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user_id: 1, status: 1 });
subscriptionSchema.index({ next_billing_date: 1, status: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
