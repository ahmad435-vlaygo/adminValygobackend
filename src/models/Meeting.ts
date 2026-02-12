import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  meetingLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'AdminUser' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    meetingLink: String,
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMeeting>('Meeting', meetingSchema);
