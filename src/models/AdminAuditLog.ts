import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAdminAuditLog extends Document {
  admin_id: Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  description: string;
  createdAt: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ admin_id: 1, createdAt: -1 });
adminAuditLogSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model<IAdminAuditLog>('AdminAuditLog', adminAuditLogSchema);
