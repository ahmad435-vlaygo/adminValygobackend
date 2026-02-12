import { Request, Response } from 'express';
import User from '../models/User';
import Kyc from '../models/Kyc';
import Subscription from '../models/Subscription';
import Transaction from '../models/Transaction';
import DashboardStats from '../models/DashboardStats';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Fetch all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      pendingKYC,
      approvedKYC,
      rejectedKYC,
      totalSubscriptions,
      activeSubscriptions,
      newUsersThisMonth,
      newUsersThisWeek,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: { $nin: ['suspended', 'inactive'] } }),
      Transaction.countDocuments(),
      Kyc.countDocuments({ status: 'pending' }),
      Kyc.countDocuments({ status: 'approved' }),
      Kyc.countDocuments({ status: 'rejected' }),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingKYC,
      approvedKYC,
      rejectedKYC,
      totalSubscriptions,
      activeSubscriptions,
      newUsersThisMonth,
      newUsersThisWeek,
      lastUpdated: new Date(),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

export const getRecentUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('firstName lastName email status type createdAt');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users',
      error: error.message,
    });
  }
};

export const getRecentTransactions = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .select('amount status type createdAt userId');

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent transactions',
      error: error.message,
    });
  }
};

export const getUsersChart = async (req: Request, res: Response) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const chartData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users chart data',
      error: error.message,
    });
  }
};

export const getKYCStats = async (req: Request, res: Response) => {
  try {
    const kycStats = await Kyc.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    kycStats.forEach((stat: any) => {
      if (stat._id === 'pending') formattedStats.pending = stat.count;
      if (stat._id === 'approved') formattedStats.approved = stat.count;
      if (stat._id === 'rejected') formattedStats.rejected = stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC stats',
      error: error.message,
    });
  }
};
