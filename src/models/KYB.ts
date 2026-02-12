import mongoose, { Document, Schema } from 'mongoose';

export interface IKYB extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  businessLegalType: string;
  businessLegalName: string;
  tradingName: string;
  registrationNumber: string;
  taxId: string;
  dateOfIncorporation: Date;
  countryOfIncorporation: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessEmail: string;
  businessPhone: string;
  website: string;
  industryType: string;
  businessDescription: string;
  numberOfEmployees: number;
  annualRevenue: string;
  documents: {
    certificateOfIncorporation: string;
    proofOfAddress: string;
    taxDocument: string;
  };
  beneficialOwners: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    ownershipPercentage: number;
    position: string;
  }>;
  plan: 'essential' | 'premium';
  currentStep: number;
  submittedAt: Date;
  reviewedAt: Date;
  approvedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const kybSchema = new Schema<IKYB>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' },
    businessLegalType: { type: String, required: true },
    businessLegalName: { type: String, required: true },
    tradingName: { type: String, default: '' },
    registrationNumber: { type: String, required: true },
    taxId: { type: String, required: true },
    dateOfIncorporation: { type: Date, required: true },
    countryOfIncorporation: { type: String, required: true },
    businessAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    businessEmail: { type: String, required: true },
    businessPhone: { type: String, required: true },
    website: { type: String, default: '' },
    industryType: { type: String, required: true },
    businessDescription: { type: String, required: true },
    numberOfEmployees: { type: Number, default: 0 },
    annualRevenue: { type: String, default: '' },
    documents: {
      certificateOfIncorporation: { type: String, default: null },
      proofOfAddress: { type: String, default: null },
      taxDocument: { type: String, default: null },
    },
    beneficialOwners: [
      {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        nationality: String,
        ownershipPercentage: Number,
        position: String,
      },
    ],
    plan: { type: String, enum: ['essential', 'premium'], default: 'essential' },
    currentStep: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

kybSchema.index({ userId: 1 });
kybSchema.index({ status: 1 });

export default mongoose.model<IKYB>('KYB', kybSchema);
