import { Request, Response } from 'express';
import Subscription from '../models/Subscription';

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};
    if (status) query.status = status;
    if (userId) query.user_id = userId;

    const subscriptions = await Subscription.find(query)
      .populate('user_id', 'firstName lastName displayName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Subscription.countDocuments(query);

    const data = subscriptions.map((sub: any) => {
      const monthlyFee = sub.amounts?.monthly_fee_usd ?? sub.monthly_fee_usd ?? 0;
      const depositLock = sub.amounts?.deposit_lock_vyo;
      const depositLockVyo = depositLock != null
        ? (typeof depositLock === 'object' && depositLock.toString ? parseFloat(depositLock.toString()) : Number(depositLock))
        : 0;
      return {
        ...sub,
        monthly_fee_usd: Number(monthlyFee),
        deposit_lock_vyo: depositLockVyo,
      };
    });

    res.json({
      success: true,
      data,
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

export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const active = await Subscription.countDocuments({ status: 'ACTIVE' });
    const pastDue = await Subscription.countDocuments({ status: 'PAST_DUE' });
    const suspended = await Subscription.countDocuments({ status: 'SUSPENDED' });
    const canceled = await Subscription.countDocuments({ status: 'CANCELED' });

    const totalMRR = await Subscription.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$amounts.monthly_fee_usd', 0] } } } },
    ]);

    res.json({
      success: true,
      data: {
        active,
        pastDue,
        suspended,
        canceled,
        total: active + pastDue + suspended + canceled,
        totalMRR: totalMRR[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ALLOWED_SUBSCRIPTION_STATUSES = ['ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED'];

export const updateSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : '';
    if (!normalizedStatus || !ALLOWED_SUBSCRIPTION_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_SUBSCRIPTION_STATUSES.join(', ')}`,
      });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status: normalizedStatus },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
