import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Subscription from '../models/Subscription';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .select('_id firstName lastName email status type country createdAt')
      .lean();

    const total = await User.countDocuments(query);

    // Get locked deposit (VYO) per user from active subscriptions
    const userIds = users.map((u: any) => u._id);
    const subsWithDeposit = await Subscription.find(
      { user_id: { $in: userIds }, status: 'ACTIVE', 'amounts.deposit_lock_vyo': { $exists: true, $ne: null } },
      { user_id: 1, amounts: 1 }
    ).lean();
    const depositMap = new Map<string, number>();
    for (const sub of subsWithDeposit) {
      const uid = (sub as any).user_id?.toString();
      if (!uid) continue;
      const dl = (sub as any).amounts?.deposit_lock_vyo;
      const val = dl != null ? (typeof dl === 'object' && dl.toString ? parseFloat(dl.toString()) : Number(dl)) : 0;
      depositMap.set(uid, (depositMap.get(uid) ?? 0) + val);
    }
    const usersWithDeposit = users.map((u: any) => ({
      ...u,
      lockedDepositVyo: depositMap.get(u._id.toString()) ?? 0,
    }));

    res.json({
      data: usersWithDeposit,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      status: { $nin: ['suspended', 'inactive'] },
    });
    const kycPending = await User.countDocuments({ 'kyc.kycStatus': false }).catch(() => 0);
    const totalVolume = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).catch(() => [{ total: 0 }]);

    res.json({
      data: {
        totalUsers,
        activeUsers,
        kycPending: typeof kycPending === 'number' ? kycPending : 0,
        totalVolume: totalVolume[0]?.total || 0,
      },
      totalUsers,
      activeUsers,
      kycPending: typeof kycPending === 'number' ? kycPending : 0,
      totalVolume: totalVolume[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const ALLOWED_STATUSES = ['active', 'inactive', 'suspended', 'pending'];

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
    if (!normalizedStatus || !ALLOWED_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(id, { status: normalizedStatus }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
