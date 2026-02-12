import mongoose, { Document, Schema } from 'mongoose';

export interface IKYC extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  title: 'Mr.' | 'Mrs.' | 'Dr.';
  nationality: string;
  occupation: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  identificationType: 'passport' | 'card' | 'id';
  personalIdentificationNumber: string;
  passportNumber: string;
  passportIssuedBy: string;
  passportIssueDate: Date;
  passportExpiryDate: Date;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  residentialAddress: string;
  residentialCity: string;
  residentialCountry: string;
  passportImage: string;
  nationalIdImage: string;
  passportSelfie: string;
  digitalSignature: string;
  currentStep: number;
  submittedAt: Date;
  reviewedAt: Date;
  approvedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const kycSchema = new Schema<IKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' },
    title: { type: String, enum: ['Mr.', 'Mrs.', 'Dr.'], default: 'Mr.' },
    nationality: { type: String, required: true },
    occupation: { type: String, default: '' },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, default: '' },
    identificationType: { type: String, enum: ['passport', 'card', 'id'], required: true },
    personalIdentificationNumber: { type: String, required: true },
    passportNumber: { type: String, default: '' },
    passportIssuedBy: { type: String, default: '' },
    passportIssueDate: { type: Date, default: null },
    passportExpiryDate: { type: Date, default: null },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    residentialAddress: { type: String, default: '' },
    residentialCity: { type: String, default: '' },
    residentialCountry: { type: String, default: '' },
    passportImage: { type: String, default: null },
    nationalIdImage: { type: String, default: null },
    passportSelfie: { type: String, default: null },
    digitalSignature: { type: String, default: null },
    currentStep: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });

export default mongoose.model<IKYC>('KYC', kycSchema);
