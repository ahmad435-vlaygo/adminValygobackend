import { Request, Response } from 'express';
import Kyc from '../models/Kyc';
import User from '../models/User';

export const getAllKycRequests = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};
    if (status) query.status = status;

    const kycRequests = await Kyc.find(query)
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Kyc.countDocuments(query);

    res.json({
      success: true,
      data: kycRequests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKycById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kyc = await Kyc.findById(id).populate('userId');

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC not found' });
    }

    res.json({ success: true, data: kyc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveKyc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const kyc = await Kyc.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        reviewedAt: new Date(),
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC not found' });
    }

    // Update user status
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'approved' });

    res.json({ success: true, data: kyc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectKyc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const kyc = await Kyc.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC not found' });
    }

    res.json({ success: true, data: kyc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKycStats = async (req: Request, res: Response) => {
  try {
    const pending = await Kyc.countDocuments({ status: 'pending' });
    const underReview = await Kyc.countDocuments({ status: 'under_review' });
    const approved = await Kyc.countDocuments({ status: 'approved' });
    const rejected = await Kyc.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      data: {
        pending,
        underReview,
        approved,
        rejected,
        total: pending + underReview + approved + rejected,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** KYC status from User model only (no documents - documents are bank-controlled) */
export const getKycStatusFromUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', kycStatus } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: String(search), $options: 'i' } },
        { lastName: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
      ];
    }
    if (kycStatus === 'verified') query['kyc.kycStatus'] = true;
    if (kycStatus === 'not_verified') query['kyc.kycStatus'] = { $ne: true };

    const users = await User.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .select('firstName lastName email kyc.kycStatus createdAt')
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users.map((u: any) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        kycStatus: u.kyc?.kycStatus === true ? 'Verified' : 'Not verified',
        createdAt: u.createdAt,
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
