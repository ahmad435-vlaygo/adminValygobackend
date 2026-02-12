/**
 * App Transaction model - mirrors valygo-pay-backend Transaction schema for real data.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  status?: string;
  transactionType?: string;
  extraType?: string;
  from_currency?: string;
  to_currency?: string;
  fee?: number;
  conversionAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, default: 0 },
    status: { type: String, default: null },
    transactionType: { type: String, trim: true, default: '' },
    extraType: { type: String, default: '' },
    from_currency: { type: String, default: '' },
    to_currency: { type: String, default: null },
    fee: { type: Number, default: 0 },
    conversionAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
