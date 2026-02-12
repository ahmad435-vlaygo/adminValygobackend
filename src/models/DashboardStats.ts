import mongoose, { Schema, Document } from 'mongoose';

export interface IDashboardStats extends Document {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  lastUpdated: Date;
}

const dashboardStatsSchema = new Schema<IDashboardStats>(
  {
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    pendingKYC: { type: Number, default: 0 },
    approvedKYC: { type: Number, default: 0 },
    rejectedKYC: { type: Number, default: 0 },
    totalSubscriptions: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    newUsersThisMonth: { type: Number, default: 0 },
    newUsersThisWeek: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IDashboardStats>('DashboardStats', dashboardStatsSchema);
