import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISalesTeamUser extends Document {
  name: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
  createdBy: mongoose.Types.ObjectId;
  referralCode: string;
  onboardedUsers: number;
  totalSubscriptions: number;
  monthlyNewSubscriptions: number;
  lastMonthNewSubscriptions: number;
  downlines: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const salesTeamUserSchema = new Schema<ISalesTeamUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    referralCode: { type: String, unique: true, required: true },
    onboardedUsers: { type: Number, default: 0 },
    totalSubscriptions: { type: Number, default: 0 },
    monthlyNewSubscriptions: { type: Number, default: 0 },
    lastMonthNewSubscriptions: { type: Number, default: 0 },
    downlines: [{ type: Schema.Types.ObjectId, ref: 'SalesTeamUser' }],
  },
  { timestamps: true }
);

// Hash password before saving
salesTeamUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
salesTeamUserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<ISalesTeamUser>('SalesTeamUser', salesTeamUserSchema);
